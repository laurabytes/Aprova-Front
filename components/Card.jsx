import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { commonStyles } from '../theme/styles';

export function Card({ children, style }) {
  return <View style={[commonStyles.card, style]}>{children}</View>;
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
};

Card.defaultProps = {
  style: {},
};

const styles = StyleSheet.create({});