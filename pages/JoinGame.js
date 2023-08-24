import React, {useState} from 'react';
import {View, StyleSheet, Text, Button, Alert} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {TextInput} from 'react-native-gesture-handler';
import theme from '../styles/theme.style';
import {createGame, joinGame} from '../utils/firebaseFunctions';
import LoadingOverlay from '../components/LoadingOverlay';
import RoundedButton from '../components/RoundedButton';

const JoinGame = ({route, navigation}) => {
  const {isCreator} = route.params;

  const [roomCode, updateRoomCode] = useState('');
  const [name, updateName] = useState('');
  const [gameType, setGameType] = useState('crazyEights');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = () => {
    setIsLoading(true);

    if (isCreator) {
      createGame(name, gameType)
        .then(gameId => {
          setIsLoading(false);
          console.log(gameId);

          navigation.navigate('Waiting Room', {
            gameId: gameId,
            isCreator: isCreator,
            name: name,
          });
        })
        .catch(error => {
          setIsLoading(false);
          Alert.alert('Something Went Wrong...', error.message);
        });
    } else {
      joinGame(name, roomCode)
        .then(() => {
          setIsLoading(false);
          // Navigate to waiting room!
          console.log('Successfully joined :)');
          navigation.navigate('Waiting Room', {
            gameId: roomCode,
            isCreator: isCreator,
            name: name,
          });
        })
        .catch(({message}) => {
          setIsLoading(false);
          Alert.alert("Couldn't Join Game", message);
        });
    }
  };

  return (
    <View style={styles.joinGameContainer}>
      <View style={styles.inputContainer}>
        {!isCreator && (
          <View style={styles.input}>
            <Text style={styles.inputPrompt}>Enter Code:</Text>
            <TextInput
              keyboardType="numeric"
              maxLength={4}
              placeholder="Code"
              underlineColorAndroid={theme.PRIMARY_COLOUR}
              onChangeText={updateRoomCode}
              value={roomCode}
            />
          </View>
        )}
        {isCreator && (
          <View style={styles.input}>
            <Text style={styles.inputPrompt}>Select Game:</Text>
            <Picker
              selectedValue={gameType}
              onValueChange={(val, ind) => {
                setGameType(val);
              }}
              mode="dropdown">
              <Picker.Item label="Crazy Eights" value="crazyEights" />
              <Picker.Item label="Go Fish" value="goFish" />
              <Picker.Item label="President" value="president" />
            </Picker>
          </View>
        )}
        <View>
          <Text style={styles.inputPrompt}>Enter Your Name:</Text>
          <TextInput
            placeholder="Name"
            maxLength={15}
            underlineColorAndroid={theme.PRIMARY_COLOUR}
            onChangeText={updateName}
            value={name}
          />
        </View>
      </View>

      <RoundedButton
        title="Submit"
        onPress={onSubmit}
        disabled={name.trim() === '' || (!isCreator && roomCode === '')}
      />
      <LoadingOverlay isLoading={isLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  joinGameContainer: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  inputContainer: {
    width: '50%',
  },
  input: {
    marginBottom: 32,
  },
  inputPrompt: {
    fontSize: theme.PROMPT_FONT_SIZE,
  },
});

export default JoinGame;
