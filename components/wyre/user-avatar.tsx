import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { WyreColors } from '@/constants/theme';
import {
  getUserDisplayName,
  getUserProfilePhotoUrl,
  type ProfileUserData,
} from '@/lib/user-display';

type UserAvatarProps = {
  userData: ProfileUserData;
  size?: number;
  selected?: boolean;
  bordered?: boolean;
};

export function UserAvatar({
  userData,
  size = 40,
  selected = false,
  bordered = true,
}: UserAvatarProps) {
  const photoUrl = getUserProfilePhotoUrl(userData);
  const firstLetter = getUserDisplayName(userData).charAt(0).toUpperCase() || '?';

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: bordered ? 2 : 0,
          borderColor: selected ? WyreColors.purpleBright : 'rgba(148,163,184,0.45)',
        },
      ]}>
      {photoUrl ? (
        <Image source={{ uri: photoUrl }} style={styles.image} contentFit="cover" />
      ) : (
        <Text style={[styles.initial, { fontSize: size * 0.46 }]}>{firstLetter}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    overflow: 'hidden',
    backgroundColor: WyreColors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initial: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
