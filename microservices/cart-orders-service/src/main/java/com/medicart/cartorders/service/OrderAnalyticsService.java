package com.medicart.cartorders.service;

import com.medicart.cartorders.client.MedicineClient;
import com.medicart.cartorders.entity.Order;
import com.medicart.cartorders.repository.OrderItemRepository;
import com.medicart.cartorders.repository.OrderRepository;
import com.medicart.common.dto.MedicineDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class OrderAnalyticsService {

    private static final List<String> SUPPORTED_RANGES = List.of("daily", "weekly", "monthly", "yearly");

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final MedicineClient medicineClient;

    public OrderAnalyticsService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            MedicineClient medicineClient
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.medicineClient = medicineClient;
    }

    public Map<String, Long> getOrderCounts() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime startOfWeek = today.with(DayOfWeek.MONDAY).atStartOfDay();
        LocalDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime startOfYear = today.withDayOfYear(1).atStartOfDay();

        long totalOrders = orderRepository.count();
    long ordersToday = orderRepository.countByOrderDateAfter(startOfToday);
    long ordersThisWeek = orderRepository.countByOrderDateAfter(startOfWeek);
    long ordersThisMonth = orderRepository.countByOrderDateAfter(startOfMonth);
    long ordersThisYear = orderRepository.countByOrderDateAfter(startOfYear);

        return Map.of(
                "totalOrders", totalOrders,
                "ordersToday", ordersToday,
                "ordersThisWeek", ordersThisWeek,
                "ordersThisMonth", ordersThisMonth,
                "ordersThisYear", ordersThisYear
        );
    }

    public Map<String, Double> getRevenueSummary() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime startOfWeek = today.with(DayOfWeek.MONDAY).atStartOfDay();
        LocalDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime startOfYear = today.withDayOfYear(1).atStartOfDay();

        double totalRevenue = safeDouble(orderRepository.sumTotalAmount());
        double revenueToday = safeDouble(orderRepository.sumTotalAmountAfter(startOfToday));
        double revenueThisWeek = safeDouble(orderRepository.sumTotalAmountAfter(startOfWeek));
        double revenueThisMonth = safeDouble(orderRepository.sumTotalAmountAfter(startOfMonth));
        double revenueThisYear = safeDouble(orderRepository.sumTotalAmountAfter(startOfYear));
        long totalOrders = orderRepository.count();
        double avgOrderValue = totalOrders == 0 ? 0.0 : totalRevenue / totalOrders;

        Map<String, Double> response = new HashMap<>();
        response.put("totalRevenue", totalRevenue);
        response.put("revenueToday", revenueToday);
        response.put("revenueThisWeek", revenueThisWeek);
        response.put("revenueThisMonth", revenueThisMonth);
        response.put("revenueThisYear", revenueThisYear);
        response.put("avgOrderValue", avgOrderValue);
        return response;
    }

    public Map<String, Long> getOrderStatusDistribution() {
        Map<String, Long> distribution = new HashMap<>();
        for (Object[] row : orderRepository.countOrdersByStatus()) {
            if (row == null || row.length < 2) continue;
            String status = row[0] != null ? row[0].toString() : "UNKNOWN";
            Long count = row[1] != null ? ((Number) row[1]).longValue() : 0L;
            distribution.put(status, count);
        }
        return distribution;
    }

    public List<Map<String, Object>> getTopProducts(int limit) {
        List<Object[]> rows = orderItemRepository.findTopProducts(PageRequest.of(0, Math.max(limit, 1)));
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            if (row == null || row.length < 3) continue;
            Long medicineId = row[0] != null ? ((Number) row[0]).longValue() : null;
            Long totalQuantity = row[1] != null ? ((Number) row[1]).longValue() : 0L;
            Double totalRevenue = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;

            Map<String, Object> entry = new HashMap<>();
            entry.put("medicineId", medicineId);
            entry.put("totalQuantity", totalQuantity);
            entry.put("totalRevenue", totalRevenue);

            if (medicineId != null) {
                try {
                    MedicineDTO medicine = medicineClient.getMedicineById(medicineId);
                    entry.put("medicineName", medicine.getName());
                    entry.put("category", medicine.getCategory());
                } catch (Exception e) {
                    log.warn("Failed to fetch medicine details for id {}: {}", medicineId, e.getMessage());
                }
            }

            result.add(entry);
        }
        return result;
    }

    public List<Map<String, Object>> getSalesByCategory() {
        List<Object[]> rows = orderItemRepository.findRevenueByMedicine();
        if (rows == null || rows.isEmpty()) {
            return Collections.emptyList();
        }

        Map<String, Double> revenueByCategory = new HashMap<>();
        Map<Long, MedicineDTO> medicineCache = new HashMap<>();

        for (Object[] row : rows) {
            if (row == null || row.length < 2) continue;
            Long medicineId = row[0] != null ? ((Number) row[0]).longValue() : null;
            Double revenue = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
            if (medicineId == null || revenue <= 0) continue;

            MedicineDTO medicine = medicineCache.get(medicineId);
            if (medicine == null) {
                try {
                    medicine = medicineClient.getMedicineById(medicineId);
                    medicineCache.put(medicineId, medicine);
                } catch (Exception e) {
                    log.warn("Failed to fetch medicine details for id {}: {}", medicineId, e.getMessage());
                }
            }

            String category = (medicine != null && medicine.getCategory() != null && !medicine.getCategory().isBlank())
                    ? medicine.getCategory()
                    : "Uncategorized";
            revenueByCategory.merge(category, revenue, Double::sum);
        }

        return revenueByCategory.entrySet()
                .stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .map(entry -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("category", entry.getKey());
                    item.put("totalRevenue", entry.getValue());
                    return item;
                })
                .toList();
    }

    public List<Map<String, Object>> getOrderSeries(String range) {
        SeriesResult series = buildSeries(normalizeRange(range));
        List<Map<String, Object>> response = new ArrayList<>();

        if (series == null || series.buckets == null) {
            return response;
        }

        for (SeriesBucket bucket : series.buckets) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("label", bucket.label);
            entry.put("orders", series.orderCounts.getOrDefault(bucket.key, 0L));
            response.add(entry);
        }
        return response;
    }

    public List<Map<String, Object>> getRevenueSeries(String range) {
        SeriesResult series = buildSeries(normalizeRange(range));
        List<Map<String, Object>> response = new ArrayList<>();

        if (series == null || series.buckets == null) {
            return response;
        }

        for (SeriesBucket bucket : series.buckets) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("label", bucket.label);
            entry.put("value", series.revenueTotals.getOrDefault(bucket.key, 0.0));
            response.add(entry);
        }
        return response;
    }

    public Map<String, Object> getSalesReport(LocalDate startDate, LocalDate endDate) {
        LocalDate safeStart = startDate != null ? startDate : LocalDate.now().minusDays(6);
        LocalDate safeEnd = endDate != null ? endDate : LocalDate.now();

        LocalDateTime start = safeStart.atStartOfDay();
        LocalDateTime end = safeEnd.plusDays(1).atStartOfDay();

    List<Order> orders = safeOrders(orderRepository.findByOrderDateBetween(start, end));

        Map<LocalDate, Long> ordersByDay = new HashMap<>();
        Map<LocalDate, Double> revenueByDay = new HashMap<>();
        for (Order order : orders) {
            LocalDateTime orderTimestamp = resolveOrderTimestamp(order);
            if (orderTimestamp == null) continue;
            LocalDate date = orderTimestamp.toLocalDate();
            ordersByDay.merge(date, 1L, Long::sum);
            revenueByDay.merge(date, safeDouble(order.getTotalAmount()), Double::sum);
        }

        List<Map<String, Object>> dailySales = new ArrayList<>();
        LocalDate cursor = safeStart;
        while (!cursor.isAfter(safeEnd)) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("date", cursor.toString());
            row.put("totalOrders", ordersByDay.getOrDefault(cursor, 0L));
            row.put("totalRevenue", revenueByDay.getOrDefault(cursor, 0.0));
            dailySales.add(row);
            cursor = cursor.plusDays(1);
        }

        long totalOrders = orders.size();
        double totalRevenue = revenueByDay.values().stream().mapToDouble(Double::doubleValue).sum();
        double avgOrderValue = totalOrders == 0 ? 0.0 : totalRevenue / totalOrders;

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("startDate", safeStart.toString());
        report.put("endDate", safeEnd.toString());
        report.put("totalOrders", totalOrders);
        report.put("totalRevenue", totalRevenue);
        report.put("avgOrderValue", avgOrderValue);
        report.put("dailySales", dailySales);
        return report;
    }

    private SeriesResult buildSeries(String normalized) {
        LocalDate today = LocalDate.now();
        LocalDateTime end = today.plusDays(1).atStartOfDay();

        List<SeriesBucket> buckets = new ArrayList<>();
        Map<Object, Long> orderCounts = new HashMap<>();
        Map<Object, Double> revenueTotals = new HashMap<>();

        if ("daily".equals(normalized)) {
            LocalDateTime start = today.atStartOfDay();
            List<Order> orders = safeOrders(orderRepository.findByOrderDateBetween(start, end));
            long count = orders.size();
            double revenue = orders.stream().mapToDouble(o -> safeDouble(o.getTotalAmount())).sum();
            buckets.add(new SeriesBucket(today, today.format(DateTimeFormatter.ofPattern("MMM d"))));
            orderCounts.put(today, count);
            revenueTotals.put(today, revenue);
            return new SeriesResult(buckets, orderCounts, revenueTotals);
        }

        if ("monthly".equals(normalized)) {
            LocalDate startDate = today.withDayOfMonth(1);
            LocalDateTime start = startDate.atStartOfDay();
            List<Order> orders = safeOrders(orderRepository.findByOrderDateBetween(start, end));

            for (Order order : orders) {
                LocalDateTime orderTimestamp = resolveOrderTimestamp(order);
                if (orderTimestamp == null) continue;
                LocalDate date = orderTimestamp.toLocalDate();
                orderCounts.merge(date, 1L, Long::sum);
                revenueTotals.merge(date, safeDouble(order.getTotalAmount()), Double::sum);
            }

            LocalDate cursor = startDate;
            while (!cursor.isAfter(today)) {
                buckets.add(new SeriesBucket(cursor, String.valueOf(cursor.getDayOfMonth())));
                cursor = cursor.plusDays(1);
            }
            return new SeriesResult(buckets, orderCounts, revenueTotals);
        }

        if ("yearly".equals(normalized)) {
            YearMonth startMonth = YearMonth.of(today.getYear(), 1);
            LocalDateTime start = startMonth.atDay(1).atStartOfDay();
            List<Order> orders = safeOrders(orderRepository.findByOrderDateBetween(start, end));

            Map<YearMonth, Long> ordersByMonth = new HashMap<>();
            Map<YearMonth, Double> revenueByMonth = new HashMap<>();
            for (Order order : orders) {
                LocalDateTime orderTimestamp = resolveOrderTimestamp(order);
                if (orderTimestamp == null) continue;
                YearMonth month = YearMonth.from(orderTimestamp);
                ordersByMonth.merge(month, 1L, Long::sum);
                revenueByMonth.merge(month, safeDouble(order.getTotalAmount()), Double::sum);
            }

            YearMonth cursor = startMonth;
            YearMonth endMonth = YearMonth.of(today.getYear(), 12);
            while (!cursor.isAfter(endMonth)) {
                buckets.add(new SeriesBucket(cursor, cursor.getMonth().name().substring(0, 3)));
                orderCounts.put(cursor, ordersByMonth.getOrDefault(cursor, 0L));
                revenueTotals.put(cursor, revenueByMonth.getOrDefault(cursor, 0.0));
                cursor = cursor.plusMonths(1);
            }
            return new SeriesResult(buckets, orderCounts, revenueTotals);
        }

        LocalDate startDate = today.minusDays(6);
        LocalDateTime start = startDate.atStartOfDay();
    List<Order> orders = safeOrders(orderRepository.findByOrderDateBetween(start, end));

        for (Order order : orders) {
            LocalDateTime orderTimestamp = resolveOrderTimestamp(order);
            if (orderTimestamp == null) continue;
            LocalDate date = orderTimestamp.toLocalDate();
            orderCounts.merge(date, 1L, Long::sum);
            revenueTotals.merge(date, safeDouble(order.getTotalAmount()), Double::sum);
        }

        LocalDate cursor = startDate;
        while (!cursor.isAfter(today)) {
            buckets.add(new SeriesBucket(cursor, cursor.getDayOfWeek().name().substring(0, 3)));
            cursor = cursor.plusDays(1);
        }

        return new SeriesResult(buckets, orderCounts, revenueTotals);
    }

    private String normalizeRange(String range) {
        if (range == null || range.isBlank()) {
            return "weekly";
        }
        String normalized = range.trim().toLowerCase();
        if (!SUPPORTED_RANGES.contains(normalized)) {
            log.warn("Unsupported range '{}' supplied. Defaulting to weekly.", range);
            return "weekly";
        }
        return normalized;
    }

    private List<Order> safeOrders(List<Order> orders) {
        return orders == null ? Collections.emptyList() : orders;
    }

    private LocalDateTime resolveOrderTimestamp(Order order) {
        if (order == null) return null;
        if (order.getCreatedAt() != null) return order.getCreatedAt();
        return order.getOrderDate();
    }

    private static class SeriesBucket {
        private final Object key;
        private final String label;

        SeriesBucket(Object key, String label) {
            this.key = key;
            this.label = label;
        }
    }

    private static class SeriesResult {
        private final List<SeriesBucket> buckets;
        private final Map<Object, Long> orderCounts;
        private final Map<Object, Double> revenueTotals;

        SeriesResult(List<SeriesBucket> buckets, Map<Object, Long> orderCounts, Map<Object, Double> revenueTotals) {
            this.buckets = buckets;
            this.orderCounts = orderCounts;
            this.revenueTotals = revenueTotals;
        }
    }

    private double safeDouble(Double value) {
        return value == null ? 0.0 : value;
    }
}
