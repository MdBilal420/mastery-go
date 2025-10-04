import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

export default function TabTwoScreen() {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotateY: `${rotation.value}deg` }
      ],
    };
  });
  
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#2c2c4c', dark: '#1a1a2e' }}
      headerImage={
        <Animated.View style={[styles.headerImageContainer, animatedStyle]}>
          <IconSymbol
            size={310}
            color="#00aaff"
            name="chevron.left.forwardslash.chevron.right"
            style={styles.headerImage}
          />
        </Animated.View>
      }>
      <ThemedView style={styles.titleContainer}>
        <Animated.View 
          style={animatedStyle}
          onTouchStart={() => {
            scale.value = withTiming(0.95, { duration: 100 });
            rotation.value = withTiming(10, { duration: 100 });
          }}
          onTouchEnd={() => {
            scale.value = withTiming(1, { duration: 100 });
            rotation.value = withTiming(0, { duration: 100 });
          }}
        >
          <ThemedText
            type="title"
            style={[
              styles.title,
              {
                fontFamily: Fonts.rounded,
              }
            ]}>
            Explore
          </ThemedText>
        </Animated.View>
      </ThemedView>
      
      <AnimatedCollapsible title="File-based routing">
        <ThemedText>
          This app has two screens:{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
        </ThemedText>
        <ThemedText>
          The layout file in <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
          sets up the tab navigator.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </AnimatedCollapsible>
      
      <AnimatedCollapsible title="Android, iOS, and web support">
        <ThemedText>
          You can open this project on Android, iOS, and the web. To open the web version, press{' '}
          <ThemedText type="defaultSemiBold">w</ThemedText> in the terminal running this project.
        </ThemedText>
      </AnimatedCollapsible>
      
      <AnimatedCollapsible title="Images">
        <ThemedText>
          For static images, you can use the <ThemedText type="defaultSemiBold">@2x</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">@3x</ThemedText> suffixes to provide files for
          different screen densities
        </ThemedText>
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={{ width: 100, height: 100, alignSelf: 'center' }}
        />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </AnimatedCollapsible>
      
      <AnimatedCollapsible title="Light and dark mode components">
        <ThemedText>
          This template has light and dark mode support. The{' '}
          <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> hook lets you inspect
          what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </AnimatedCollapsible>
      
      <AnimatedCollapsible title="Animations">
        <ThemedText>
          This template includes an example of an animated component. The{' '}
          <ThemedText type="defaultSemiBold">components/HelloWave.tsx</ThemedText> component uses
          the powerful{' '}
          <ThemedText type="defaultSemiBold" style={{ fontFamily: Fonts.mono }}>
            react-native-reanimated
          </ThemedText>{' '}
          library to create a waving hand animation.
        </ThemedText>
        {Platform.select({
          ios: (
            <ThemedText>
              The <ThemedText type="defaultSemiBold">components/ParallaxScrollView.tsx</ThemedText>{' '}
              component provides a parallax effect for the header image.
            </ThemedText>
          ),
        })}
      </AnimatedCollapsible>
    </ParallaxScrollView>
  );
}

// Animated version of Collapsible component
function AnimatedCollapsible({ title, children }: { title: string; children: React.ReactNode }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });
  
  return (
    <Animated.View 
      style={[{ marginBottom: 10 }, animatedStyle]}
      onTouchStart={() => {
        scale.value = withTiming(0.98, { duration: 100 });
      }}
      onTouchEnd={() => {
        scale.value = withTiming(1, { duration: 100 });
      }}
    >
      <Collapsible title={title}>
        {children}
      </Collapsible>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  headerImageContainer: {
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  headerImage: {
    color: '#00aaff',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 170, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});