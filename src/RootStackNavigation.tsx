import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ArrowLeft } from '@tamagui/lucide-icons'

import { InvoiceList } from './screens/InvoiceList'
import { InvoiceDetails } from './screens/InvoiceDetails'
import { InvoiceForm } from './screens/InvoiceForm'

const RootStack = createNativeStackNavigator()

const ICON_SIZE = 24
const ICON_COLOR = 'black'
const ICON_PRESS_STYLE = { opacity: 0.7 }

const RootStackNavigation = () => {
  return (
    <NavigationContainer>
      <RootStack.Navigator initialRouteName="InvoiceList">
        <RootStack.Screen
          name="InvoiceList"
          component={InvoiceList}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="InvoiceDetails"
          component={InvoiceDetails}
          options={({ navigation }) => ({
            title: '',
            headerLeft: () => (
              <ArrowLeft
                size={ICON_SIZE}
                color={ICON_COLOR}
                onPress={() => navigation.goBack()}
                pressStyle={ICON_PRESS_STYLE}
              />
            ),
          })}
        />
        <RootStack.Screen
          name="InvoiceForm"
          component={InvoiceForm}
          options={({ navigation }) => ({
            title: '',
            headerLeft: () => (
              <ArrowLeft
                size={ICON_SIZE}
                color={ICON_COLOR}
                onPress={() => navigation.goBack()}
                pressStyle={ICON_PRESS_STYLE}
              />
            ),
          })}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  )
}

export default RootStackNavigation
