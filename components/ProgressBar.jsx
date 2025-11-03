import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

export function ProgressBar({ progress, color, height }) {

  const progressPercent = `${Math.min(100, Math.max(0, progress * 100))}%`;

  return (
    <View style={[styles.container, { height }]}>
      <View
        style={[
          styles.progress,
          {
            width: progressPercent,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

ProgressBar.propTypes = {
 
  progress: PropTypes.number.isRequired,
  
  color: PropTypes.string,
  
  height: PropTypes.number,
};

ProgressBar.defaultProps = {
  color: colors.accent,
  height: 8,
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.gray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
});