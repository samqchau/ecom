import React, { useEffect, useState } from 'react';
import { ListGroup, Row, Col, Image, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getOrderDetails } from '../actions/orderActions';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PayPalButton } from 'react-paypal-button-v2';
import { updateOrderToPaid } from '../actions/orderActions';
import { ORDER_PAY_RESET } from '../constants/orderConstants';

const OrderDetailsScreen = ({ match }) => {
  const [sdkReady, setSdkReady] = useState(false);

  const dispatch = useDispatch();
  const orderDetails = useSelector((state) => state.orderDetails);
  const { order, loading, success, error } = orderDetails;
  const orderPay = useSelector((state) => state.orderPay);
  const {
    success: orderPaySuccess,
    loading: orderPayLoading,
    error: orderPayError,
  } = orderPay;

  const orderId = match.params.id;

  const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2);
  };
  //calculate prices
  order.itemsPrice = addDecimals(
    order.orderItems.reduce(
      (total, item) => Number(total + item.price * item.quantity),
      0
    )
  );
  order.totalPrice = addDecimals(
    Number(order.itemsPrice) +
      Number(order.shippingPrice) +
      Number(order.taxPrice)
  );

  useEffect(() => {
    const addPayPalScript = async () => {
      const { data: clientId } = await axios.get('/api/config/paypal');
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`;
      script.asycn = true;
      script.onload = () => {
        setSdkReady(true);
      };
      document.body.appendChild(script);
    };

    if (!order || order._id !== orderId || orderPaySuccess) {
      dispatch({ type: ORDER_PAY_RESET });
      dispatch(getOrderDetails(orderId));
    } else if (!order.isPaid) {
      if (!window.paypal) {
        addPayPalScript();
      } else {
        setSdkReady(true);
      }
    }
  }, [dispatch, orderId, order, orderPaySuccess]);

  const successPaymentHandler = (paymentResult) => {
    console.log(paymentResult);
    dispatch(updateOrderToPaid(orderId, paymentResult));
  };

  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>{error}</Message>
  ) : (
    <>
      {success && (
        <>
          {' '}
          <h1>Order ID: {order._id}</h1>
          <Row>
            <Col md={8}>
              <ListGroup variant='flush'>
                <ListGroup.Item>
                  <h2>Shipping</h2>
                  <strong>Name: </strong> {order.user.name}
                  <br />
                  <strong>Email: </strong>
                  <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
                  <p>
                    <strong>Address: </strong>
                    {order.shippingAddress.address},{' '}
                    {order.shippingAddress.city}{' '}
                    {order.shippingAddress.postalCode}{' '}
                    {order.shippingAddress.country}
                  </p>
                  {order.isDelivered ? (
                    <Message variant='success'>
                      Order Delivered at {order.deliveredAt}
                    </Message>
                  ) : (
                    <Message variant='danger'>Not Delivered</Message>
                  )}
                </ListGroup.Item>
                <ListGroup.Item>
                  <h2>Payment Method</h2>

                  <p>
                    <strong>Method: </strong>
                    {order.paymentMethod}
                  </p>
                  {order.isPaid ? (
                    <Message variant='success'>
                      Order Paid at {order.paidAt}
                    </Message>
                  ) : (
                    <Message variant='danger'>Not Paid</Message>
                  )}
                </ListGroup.Item>
                <ListGroup.Item>
                  <h2>Order Items</h2>
                  {order.orderItems.length === 0 ? (
                    <Message>No items in order</Message>
                  ) : (
                    <ListGroup variant='flush'>
                      {order.orderItems.map((item, index) => (
                        <ListGroup.Item key={index}>
                          <Row>
                            <Col md={1}>
                              <Image
                                src={item.image}
                                alt={item.name}
                                fluid
                                rounded
                              ></Image>
                            </Col>
                            <Col>
                              <Link to={`/product/${item.product}`}>
                                {item.name}
                              </Link>
                            </Col>
                            <Col md={4}>
                              {item.quantity} x ${item.price} = $
                              {item.quantity * item.price}
                            </Col>
                          </Row>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </ListGroup.Item>
              </ListGroup>
            </Col>
            <Col md={4}>
              <Card>
                <ListGroup variant='flush'>
                  <ListGroup.Item>
                    <h2>Order Summary</h2>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Items: </Col>
                      <Col>${order.itemsPrice}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Shipping Price</Col>
                      <Col>${order.shippingPrice}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Tax Price</Col>
                      <Col>${order.taxPrice}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Total Price</Col>
                      <Col>${order.totalPrice}</Col>
                    </Row>
                  </ListGroup.Item>
                  {!order.isPaid && (
                    <ListGroup.Item>
                      {orderPayLoading || !sdkReady ? (
                        <Loader />
                      ) : (
                        <PayPalButton
                          amount={order.totalPrice}
                          onSuccess={successPaymentHandler}
                        ></PayPalButton>
                      )}
                    </ListGroup.Item>
                  )}
                </ListGroup>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default OrderDetailsScreen;
