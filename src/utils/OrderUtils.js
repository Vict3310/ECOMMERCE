export const createOrderId = () => `ORD-${Date.now()}`;
export const createErrorOrderId = () => `ERR-${Date.now()}`;
export const createOrderDate = () => new Date().toLocaleString();
