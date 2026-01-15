import { OrderStatus } from '@prisma/client';

export class OrderItemResponseDto {
  id: string;
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
}

export class OrderResponseDto {
  id: string;
  userId: string;
  userName: string;
  userCnpj: string;
  status: OrderStatus;
  userEmail:string;
  totalAmount: number;
  items: OrderItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}