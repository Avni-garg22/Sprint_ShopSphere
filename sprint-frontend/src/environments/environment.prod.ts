export const environment = {
  production: true,
  apiUrl: 'http://localhost:8080',
  // Gateway route prefixes (Spring Cloud Gateway discovery locator)
  gatewayAuth:    'http://localhost:8080/gateway/auth',
  gatewayCatalog: 'http://localhost:8080/gateway/catalog',
  gatewayOrders:  'http://localhost:8080/gateway/orders',
  gatewayPayment: 'http://localhost:8080/gateway/payment',
  gatewayAdmin:   'http://localhost:8080/gateway/admin',
  gatewayNotify:  'http://localhost:8080/gateway/notify',
  catalogAssets:  'http://localhost:8084',
};
