package com.sprint.order_service.service;

import com.sprint.order_service.entity.Cart;
import com.sprint.order_service.entity.CartItem;
import com.sprint.order_service.repository.CartItemRepository;
import com.sprint.order_service.repository.CartRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartRepository cartRepo;

    @Mock
    private CartItemRepository cartItemRepo;

    @InjectMocks
    private CartService cartService;

    @Test
    void getCart_ShouldReturnExistingCart() {
        Cart cart = new Cart();
        cart.setUserId(1L);
        cart.setItems(new ArrayList<>());
        when(cartRepo.findByUserId(1L)).thenReturn(Optional.of(cart));

        Cart result = cartService.getCart(1L);

        assertEquals(1L, result.getUserId());
        verify(cartRepo, never()).save(any());
    }

    @Test
    void getCart_ShouldCreateNewCart_WhenNotExists() {
        Cart newCart = new Cart();
        newCart.setUserId(1L);
        newCart.setItems(new ArrayList<>());
        when(cartRepo.findByUserId(1L)).thenReturn(Optional.empty());
        when(cartRepo.save(any(Cart.class))).thenReturn(newCart);

        Cart result = cartService.getCart(1L);

        assertEquals(1L, result.getUserId());
        verify(cartRepo).save(any(Cart.class));
    }

    @Test
    void updateItem_ShouldUpdateQuantity() {
        CartItem item = new CartItem();
        item.setId(1L);
        item.setQuantity(2);
        when(cartItemRepo.findById(1L)).thenReturn(Optional.of(item));
        when(cartItemRepo.save(any(CartItem.class))).thenAnswer(i -> i.getArguments()[0]);

        CartItem result = cartService.updateItem(1L, 5);

        assertEquals(5, result.getQuantity());
    }

    @Test
    void updateItem_ShouldThrowException_WhenItemNotFound() {
        when(cartItemRepo.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> cartService.updateItem(99L, 3));

        assertEquals("Cart item not found", ex.getMessage());
    }

    @Test
    void removeItem_ShouldDeleteItem() {
        cartService.removeItem(1L);
        verify(cartItemRepo).deleteById(1L);
    }
}
