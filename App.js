import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Home from "./screens/Home";
import Login from "./screens/Login";
import Register from "./screens/Register";
import ProfileScreen from "./screens/Profile";
import CameraScreen from "./screens/Camera";
import ClickedScreen from "./screens/PhotoDetail";
import Blogs from "./screens/Blogs";
import BlogDetails from "./screens/BlogDetails";
import ChatScreen from "./screens/Chat";


const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const DrawerNavigator = () => (
  <Drawer.Navigator initialRouteName="Home">
    <Drawer.Screen name="Nutrition Budget" component={Home} />
    <Drawer.Screen name="Profile" component={ProfileScreen} />
    <Drawer.Screen name="Blogs" component={Blogs} />
    <Drawer.Screen name="Chat" component={ChatScreen} />
    <Drawer.Screen name="Camera" component={CameraScreen} />
  </Drawer.Navigator>
);

const App = () => {

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Main" component={DrawerNavigator} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="ClickedScreen" component={ClickedScreen} />
        <Stack.Screen name="BlogDetails" component={BlogDetails} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
