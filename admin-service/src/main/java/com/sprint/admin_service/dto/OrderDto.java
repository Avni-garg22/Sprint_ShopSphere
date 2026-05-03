package com.sprint.admin_service.dto;

import java.util.List;

public class OrderDto {

    private Long id;
    private Long userId;
    private String status;
    private Double totalPrice;
    private String customerName;
    private String phone;
    private String addressLine;
    private String city;
    private String state;
    private String pincode;
    private String deliveryMode;
    private String paymentMode;
    private List<OrderItemDto> items;

    public OrderDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddressLine() { return addressLine; }
    public void setAddressLine(String addressLine) { this.addressLine = addressLine; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getDeliveryMode() { return deliveryMode; }
    public void setDeliveryMode(String deliveryMode) { this.deliveryMode = deliveryMode; }

    public String getPaymentMode() { return paymentMode; }
    public void setPaymentMode(String paymentMode) { this.paymentMode = paymentMode; }

    public List<OrderItemDto> getItems() { return items; }
    public void setItems(List<OrderItemDto> items) { this.items = items; }
}
