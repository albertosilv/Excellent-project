"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderResponseDto = exports.OrderItemResponseDto = void 0;
class OrderItemResponseDto {
    id;
    productId;
    description;
    quantity;
    unitPrice;
    totalPrice;
    createdAt;
}
exports.OrderItemResponseDto = OrderItemResponseDto;
class OrderResponseDto {
    id;
    userId;
    userName;
    userCnpj;
    status;
    userEmail;
    totalAmount;
    items;
    createdAt;
    updatedAt;
}
exports.OrderResponseDto = OrderResponseDto;
//# sourceMappingURL=order-response.dto.js.map