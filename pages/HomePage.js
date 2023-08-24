import React, {useEffect} from 'react';
import {
  Image,
  View,
  StyleSheet,
  Button,
  Alert,
  TouchableOpacity,
  Text,
} from 'react-native';
import theme from '../styles/theme.style';
import {cleanLocalStorage} from '../utils/firebaseFunctions';
import Logo from '../assets/logo.png';
import RoundedButton from '../components/RoundedButton';

const HomePage = ({navigation}) => {
  cleanLocalStorage();

  const onCreateGame = () => {
    // Create game logic goes here!

    navigation.navigate('Join Game', {isCreator: true});
  };

  const onJoinGame = () => {
    // Join game logic goes here!

    navigation.navigate('Join Game', {isCreator: false});
  };

  const onContinueGame = () => {
    navigation.navigate('Continue Game');
  };

  return (
    <View style={styles.homePageContainer}>
      <Image style={styles.logo} source={Logo} resizeMode="contain" />
      <View style={styles.buttonContainer}>
        <RoundedButton title={'Create Game'} onPress={onCreateGame} />
        <RoundedButton title={'Join Game'} onPress={onJoinGame} />
        <RoundedButton title={'Continue Game'} onPress={onContinueGame} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  homePageContainer: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  logo: {
    height: '20%',
    width: '70%',
  },
  buttonContainer: {
    width: '50%',
    display: 'flex',
    justifyContent: 'space-between',
    height: 156,
  },
  button: {
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: 100,
    backgroundColor: theme.PRIMARY_COLOUR,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
  },
});

export default HomePage;
