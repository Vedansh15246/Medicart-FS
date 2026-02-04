import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import java.util.Date;

public class GenerateTestJWT {
    public static void main(String[] args) {
        String secret = "your-secret-key-min-256-bits-long-for-hs256-algorithm-medicart";
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes());
        
        // Current time + 1 hour
        long currentTimeMillis = System.currentTimeMillis();
        long oneHourMillis = 3600000; // 1 hour in milliseconds
        
        String token = Jwts.builder()
                .subject("admin@medicart.com")
                .claim("scope", "ROLE_ADMIN")
                .claim("fullName", "Admin User")
                .claim("email", "admin@medicart.com")
                .issuedAt(new Date(currentTimeMillis))
                .expiration(new Date(currentTimeMillis + oneHourMillis))
                .signWith(key)
                .compact();
        
        System.out.println("Generated JWT Token:");
        System.out.println("====================");
        System.out.println(token);
        System.out.println("\nUse this token in Authorization header:");
        System.out.println("Authorization: Bearer " + token);
        System.out.println("\nExpires in 1 hour");
    }
}
