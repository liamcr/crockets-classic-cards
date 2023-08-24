import 'react-native-gesture-handler';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import HomePage from './pages/HomePage';
import JoinGame from './pages/JoinGame.js';
import WaitingRoom from './pages/WaitingRoom';
import GoFishGameplayPage from './pages/GoFishGameplayPage';
import PairedCards from './pages/PairedCards';
import GameEnd from './pages/GameEnd';
import GoFishRules from './pages/GoFishRules';
import ContinueGame from './pages/ContinueGame';
import CrazyEightsGameplayPage from './pages/CrazyEightsGameplayPage';
import GameEndCrazyEights from './pages/GameEndCrazyEights';
import CrazyEightsRules from './pages/CrazyEightsRules';
import PresidentGameplayPage from './pages/PresidentGameplayPage';
import GameEndPresident from './pages/GameEndPresident';
import PresidentRules from './pages/PresidentRules';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Home" component={HomePage} />
        <Stack.Screen name="Join Game" component={JoinGame} />
        <Stack.Screen name="Continue Game" component={ContinueGame} />
        <Stack.Screen name="Waiting Room" component={WaitingRoom} />
        <Stack.Screen name="Go Fish Gameplay" component={GoFishGameplayPage} />
        <Stack.Screen
          name="Crazy Eights Gameplay"
          component={CrazyEightsGameplayPage}
        />
        <Stack.Screen
          name="President Gameplay"
          component={PresidentGameplayPage}
        />
        <Stack.Screen name="PairedCards" component={PairedCards} />
        <Stack.Screen name="GoFishRules" component={GoFishRules} />
        <Stack.Screen name="CrazyEightsRules" component={CrazyEightsRules} />
        <Stack.Screen name="PresidentRules" component={PresidentRules} />
        <Stack.Screen name="GameEnd Go Fish" component={GameEnd} />
        <Stack.Screen
          name="GameEnd Crazy Eights"
          component={GameEndCrazyEights}
        />
        <Stack.Screen name="GameEnd President" component={GameEndPresident} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
