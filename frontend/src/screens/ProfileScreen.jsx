import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Table } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { getUserDetails, updateUserProfile } from '../actions/userActions';
import { USER_UPDATE_PROFILE_RESET } from '../constants/userConstants';
import { getOrdersByUserId } from '../actions/orderActions';
import { LinkContainer } from 'react-router-bootstrap';

const ProfileScreen = ({ location, history }) => {
  const dispatch = useDispatch();
  const userDetails = useSelector((state) => state.userDetails);
  const { user, loading, error } = userDetails;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const userUpdateProfile = useSelector((state) => state.userUpdateProfile);
  const { success } = userUpdateProfile;

  const userOrders = useSelector((state) => state.userOrders);
  const {
    success: userOrdersSuccess,
    error: userOrdersError,
    loading: userOrdersLoading,
    orders,
  } = userOrders;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!userInfo) {
      history.push('/login');
    } else {
      if (!user.name) {
        dispatch({ type: USER_UPDATE_PROFILE_RESET });
        dispatch(getUserDetails('profile'));
      } else {
        setName(user.name);
        setEmail(user.email);
      }
    }
  }, [userInfo, history, dispatch, user]);

  useEffect(() => {
    dispatch(getOrdersByUserId());
  }, [dispatch]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
    } else {
      dispatch(updateUserProfile({ id: user._id, name, email, password }));
    }
  };

  return (
    <Row>
      <Col md={3}>
        <h2>User Profile</h2>
        {message && <Message variant='danger'>{message}</Message>}
        {error && <Message variant='danger'>{error}</Message>}
        {success && <Message variant='success'>Profile Updated</Message>}
        {loading && <Loader />}
        <Form onSubmit={submitHandler}>
          <Form.Group controlId='name'>
            <Form.Label>Name</Form.Label>
            <Form.Control
              type='name'
              placeholder='Enter name'
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          </Form.Group>
          <Form.Group controlId='email'>
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type='email'
              placeholder='Enter email'
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
          </Form.Group>
          <Form.Group controlId='password'>
            <Form.Label>Password</Form.Label>
            <Form.Control
              type='password'
              placeholder='Enter password'
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          </Form.Group>
          <Form.Group controlId='confirmPassword'>
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type='password'
              placeholder='Verify Password'
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
              }}
            />
          </Form.Group>

          <Button type='submit' variant='primary'>
            Update{' '}
          </Button>
        </Form>
      </Col>
      <Col md={9}>
        <h2>My Orders</h2>
        {userOrdersLoading ? (
          <Loader />
        ) : userOrdersError ? (
          <Message variant='danger' />
        ) : (
          userOrdersSuccess && (
            <Table striped bordered hover responsive className='table-sm'>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>DATE</th>
                  <th>TOTAL</th>
                  <th>PAID</th>
                  <th>DELIVERED</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                    <td>{order.createdAt.substring(0, 10)}</td>
                    <td>${order.totalPrice}</td>
                    <td>
                      {order.isPaid ? (
                        order.paidAt.substring(0, 10)
                      ) : (
                        <i className='fas fa-times' style={{ color: 'red' }} />
                      )}
                    </td>
                    <td>
                      {order.isDelivered ? (
                        order.isDelivered.substring(0, 10)
                      ) : (
                        <i className='fas fa-times' style={{ color: 'red' }} />
                      )}
                    </td>
                    <td>
                      <LinkContainer to={`/order/${order._id}`}>
                        <Button className='btn-sm' variant='dark'>
                          Details
                        </Button>
                      </LinkContainer>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )
        )}
      </Col>
    </Row>
  );
};

export default ProfileScreen;
