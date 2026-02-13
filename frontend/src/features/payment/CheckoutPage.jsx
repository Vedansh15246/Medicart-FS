import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { orderService } from "../../api/orderService";
import { clearCart, fetchCart } from "../../components/cart/cartSlice";
 
const CheckoutPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const cart = useSelector((state) => state.cart);
    const auth = useSelector((state) => state.auth);
   
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
 
    // ✅ Sync with DB on refresh if state is lost
    useEffect(() => {
        if (cart.status === 'idle') {
            dispatch(fetchCart());
        }
    }, [dispatch, cart.status]);
 
    // ✅ Load user addresses
    useEffect(() => {
        const loadAddresses = async () => {
            try {
                setLoadingAddresses(true);
                const data = await orderService.getAddresses();
                setAddresses(data || []);
                if (data && data.length > 0) {
                    setSelectedAddress(data[0].id); // Select first address by default
                }
            } catch (error) {
                console.error("Error loading addresses:", error);
            } finally {
                setLoadingAddresses(false);
            }
        };
        loadAddresses();
    }, []);
 
    const subtotal = cart.items.reduce((acc, item) => {
        const price = item.product?.price || 0;
        return acc + (price * item.qty);
    }, 0);
 
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const delivery = subtotal > 500 ? 0 : 40; // Free delivery for orders > 500
    const total = subtotal + tax + delivery;
 
    const handlePlaceOrder = async (e) => {
        e.preventDefault();
       
        if (!selectedAddress) {
            alert("Please select a delivery address");
            return;
        }
 
        // ✅ UPDATED FLOW: Don't create order yet, just pass addressId to payment
        // Order will be created during payment processing (after selecting payment method)
        navigate('/payment/select', {
            state: {
                selectedAddressId: selectedAddress,
                cartItems: cart.items,
                subtotal,
                tax,
                delivery,
                total,
                itemCount: cart.items.length
            }
        });
    };
 
    if (cart.status === 'loading') {
        return <div className="p-6 text-center text-gray-500">Syncing your cart...</div>;
    }
 
    if (!auth?.user) {
        return <div className="p-6 text-center text-red-500">Please login to continue</div>;
    }
 
    return (
        <div className="p-6 max-w-2xl mx-auto bg-white shadow rounded">
            <h2 className="text-2xl font-bold mb-6 border-b pb-3">Order Summary</h2>
           
            {/* Delivery Address Section */}
            {loadingAddresses ? (
                <div className="mb-6 p-4 bg-blue-50 rounded">Loading addresses...</div>
            ) : (
                <div className="mb-6 p-4 bg-blue-50 rounded">
                    <h3 className="font-bold mb-3">Delivery Address</h3>
                    {addresses.length === 0 ? (
                        <p className="text-gray-600">No addresses saved. Please add one in your profile.</p>
                    ) : (
                        <select
                            value={selectedAddress || ''}
                            onChange={(e) => setSelectedAddress(parseInt(e.target.value))}
                            className="w-full p-2 border rounded"
                        >
                            {addresses.map(addr => (
                                <option key={addr.id} value={addr.id}>
                                    {addr.streetAddress}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            )}
 
            {/* Cart Items */}
            {cart.items.length === 0 ? (
                <p className="text-center py-8 text-gray-500 text-lg">Your cart is empty</p>
            ) : (
                <>
                    <div className="mb-6">
                        <h3 className="font-bold mb-3">Items</h3>
                        <div className="max-h-64 overflow-y-auto bg-gray-50 p-3 rounded">
                            {cart.items.map(item => (
                                <div key={item.product?.id} className="flex justify-between py-2 border-b last:border-b-0">
                                    <span>{item.product?.name} x{item.qty}</span>
                                    <span className="font-semibold">₹{(item.product?.price * item.qty).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                   
                    {/* Price Breakdown */}
                    <div className="mt-6 pt-4 border-t space-y-2">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax (18% GST):</span>
                            <span>₹{tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Delivery Charge:</span>
                            <span>{delivery === 0 ? <span className="text-green-600">Free</span> : `₹${delivery}`}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                            <span>Total Amount:</span>
                            <span className="text-green-600">₹{total.toFixed(2)}</span>
                        </div>
                    </div>
                </>
            )}
 
            <button
                onClick={handlePlaceOrder}
                disabled={cart.items.length === 0 || !selectedAddress}
                className={`w-full mt-6 py-3 text-white rounded font-bold transition text-lg ${
                    cart.items.length === 0 || !selectedAddress
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
            >
                {`Proceed to Payment ₹${total.toFixed(2)}`}
            </button>
        </div>
    );
};
 
export default CheckoutPage;