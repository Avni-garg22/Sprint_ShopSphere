package com.sprint.order_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sprint.order_service.entity.Cart;
import com.sprint.order_service.entity.CartItem;
import com.sprint.order_service.repository.CartItemRepository;
import com.sprint.order_service.repository.CartRepository;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepo;

    @Autowired
    private CartItemRepository cartItemRepo;

    @Transactional
    public Cart getCart(Long userId) {
        Cart cart = cartRepo.findByUserId(userId).orElseGet(() -> {
            Cart c = new Cart();
            c.setUserId(userId);
            return cartRepo.save(c);
        });
        cart.getItems().size(); // force load
        return cart;
    }

    @Transactional
    public Cart addItem(Long userId, CartItem item) {
        Cart cart = getCart(userId);
        item.setCart(cart);
        cartItemRepo.save(item);
        cart.getItems().size(); // force load items within transaction
        return cart;
    }

    public CartItem updateItem(Long itemId, int quantity) {
        CartItem item = cartItemRepo.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        item.setQuantity(quantity);
        return cartItemRepo.save(item);
    }

    public void removeItem(Long itemId) {
        cartItemRepo.deleteById(itemId);
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = cartRepo.findByUserId(userId).orElse(null);
        if (cart == null) {
            return;
        }
        cart.getItems().clear();
        cartRepo.save(cart);
    }
}
