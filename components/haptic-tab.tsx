import * as Haptics from 'expo-haptics';
import { PlatformPressable } from 'expo-router/react-navigation';
import type { ComponentProps } from 'react';

// expo-router bundles React Navigation; use its copy so tab button props line up.
export function HapticTab(props: ComponentProps<typeof PlatformPressable>) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
