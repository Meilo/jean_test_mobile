import '@testing-library/react-native/extend-expect'

jest.mock('./src/api', () => ({
  ...jest.requireActual('./src/api'),
  useApi: jest.fn(),
}))

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}))

jest.useFakeTimers()
