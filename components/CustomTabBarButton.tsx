import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface CustomTabBarButtonProps extends BottomTabBarButtonProps {
  onPress?: () => void;
}

export const CustomTabBarButton: React.FC<CustomTabBarButtonProps> = (props) => {
  const handlePress = () => {
    if (props.onPress) {
      props.onPress();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {props.children}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    top: -35,
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    height: 90,
    position: 'absolute',
    left: '50%',
    marginLeft: -45,
  },
  button: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 