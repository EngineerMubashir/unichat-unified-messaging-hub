import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import colors from '../Constant/Color';

type RootStackParamList = {
  Connect: undefined;
};

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Connect'>;
};

type PasswordValidation = {
  minLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumbers: boolean;
  hasSpecialChar: boolean;
  isValid: boolean;
};

type PasswordValidationKey = keyof Omit<PasswordValidation, 'isValid'>;

// Fixed credentials
const VALID_EMAIL = 'ilmequraninstitute56@gmail.com';
const VALID_PASSWORD = 'ilmequran@123';

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ name: '', email: '', password: '' });

  const validatePassword = (pwd: string): PasswordValidation => {
    const minLength = pwd.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid:
        minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumbers &&
        hasSpecialChar,
    };
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, label: '', color: '#ddd' };

    const validation = validatePassword(pwd);
    const score = [
      validation.minLength,
      validation.hasUpperCase,
      validation.hasLowerCase,
      validation.hasNumbers,
      validation.hasSpecialChar,
    ].filter(Boolean).length;

    if (score <= 2) return { strength: score * 20, label: 'Weak', color: '#ff3b30' };
    if (score === 3) return { strength: score * 20, label: 'Fair', color: '#ff9500' };
    if (score === 4) return { strength: score * 20, label: 'Good', color: '#ffcc02' };
    return { strength: 100, label: 'Strong', color: '#34c759' };
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: '', email: '', password: '' };

    if (!isLogin && !name) {
      newErrors.name = 'Name is required';
      isValid = false;
    } else if (!isLogin && name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      isValid = false;
    }

    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    } else if (isLogin && email !== VALID_EMAIL) {
      // Check for valid email only during login
      newErrors.email = 'Invalid email address';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (isLogin && password !== VALID_PASSWORD) {
      // Check for valid password only during login
      newErrors.password = 'Invalid password';
      isValid = false;
    } else if (!isLogin && !validatePassword(password).isValid) {
      newErrors.password = 'Password must meet all security requirements';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      if (isLogin) {
        // Additional check for login credentials
        if (email === VALID_EMAIL && password === VALID_PASSWORD) {
          navigation.navigate('Connect');
        } else {
          setErrors({
            name: '',
            email: email !== VALID_EMAIL ? 'Invalid email address' : '',
            password: password !== VALID_PASSWORD ? 'Invalid password' : '',
          });
        }
      } else {
        // For sign up, you can decide whether to allow registration or not
        // For now, I'll show an error that only existing account can login
        setErrors({
          name: '',
          email: 'Only existing account holders can access this app',
          password: '',
        });
      }
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setErrors({ name: '', email: '', password: '' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to uniChat</Text>
      <Text style={styles.subtitle}>Login or sign up to access your account</Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, isLogin && styles.activeTab]}
          onPress={() => {
            setIsLogin(true);
            resetForm();
          }}
        >
          <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, !isLogin && styles.activeTab]}
          onPress={() => {
            setIsLogin(false);
            resetForm();
          }}
        >
          <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        {!isLogin && (
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Full Name"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Email Address"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) {
                setErrors((prev) => ({ ...prev, password: '' }));
              }
            }}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

          {!isLogin && password && (
            <View style={styles.passwordStrengthContainer}>
              <View style={styles.strengthBarContainer}>
                <View
                  style={{
                    ...styles.strengthBar,
                    width: `${getPasswordStrength(password).strength}%`,
                    backgroundColor: getPasswordStrength(password).color,
                  }}
                />
              </View>
              <Text style={{ color: getPasswordStrength(password).color }}>
                {getPasswordStrength(password).label}
              </Text>
            </View>
          )}

          {!isLogin && password && (
            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementsTitle}>Password must contain:</Text>
              <View style={styles.requirementsList}>
                {([
                  { label: 'At least 8 characters', key: 'minLength' },
                  { label: 'One uppercase letter', key: 'hasUpperCase' },
                  { label: 'One lowercase letter', key: 'hasLowerCase' },
                  { label: 'One number', key: 'hasNumbers' },
                  { label: 'One special character (!@#$%^&*)', key: 'hasSpecialChar' },
                ] as { label: string; key: PasswordValidationKey }[]).map((req, index) => (
                  <View key={index} style={styles.requirementItem}>
                    <Ionicons
                      name={validatePassword(password)[req.key] ? 'checkmark-circle' : 'close-circle'}
                      size={16}
                      color={validatePassword(password)[req.key] ? '#34c759' : '#ff3b30'}
                    />
                    <Text
                      style={{
                        color: validatePassword(password)[req.key] ? '#34c759' : '#ff3b30',
                        fontSize: 12,
                      }}
                    >
                      {req.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {isLogin && (
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>
        )}

        <LinearGradient
          colors={colors.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.submitButtonGradient}
        >
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>{isLogin ? 'Login' : 'Sign Up'}</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 60,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  tabText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.accent,
    fontWeight: '600',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#1A1A1A',
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 12,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: colors.accent,
    fontSize: 14,
  },
  submitButtonGradient: {
    borderRadius: 8,
    marginTop: 10,
  },
  submitButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  submitButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  passwordStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  strengthBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
  strengthBar: {
    height: 4,
    borderRadius: 2,
  },
  passwordRequirements: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.textPrimary,
  },
  requirementsList: {
    gap: 6,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});

// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import colors from '../Constant/Color';

// type RootStackParamList = {
//   Connect: undefined;
// };

// type LoginScreenProps = {
//   navigation: NativeStackNavigationProp<RootStackParamList, 'Connect'>;
// };

// type PasswordValidation = {
//   minLength: boolean;
//   hasUpperCase: boolean;
//   hasLowerCase: boolean;
//   hasNumbers: boolean;
//   hasSpecialChar: boolean;
//   isValid: boolean;
// };

// type PasswordValidationKey = keyof Omit<PasswordValidation, 'isValid'>;

// export default function LoginScreen({ navigation }: LoginScreenProps) {
//   const [isLogin, setIsLogin] = useState(true);
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [errors, setErrors] = useState({ name: '', email: '', password: '' });

//   const validatePassword = (pwd: string): PasswordValidation => {
//     const minLength = pwd.length >= 8;
//     const hasUpperCase = /[A-Z]/.test(pwd);
//     const hasLowerCase = /[a-z]/.test(pwd);
//     const hasNumbers = /\d/.test(pwd);
//     const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

//     return {
//       minLength,
//       hasUpperCase,
//       hasLowerCase,
//       hasNumbers,
//       hasSpecialChar,
//       isValid:
//         minLength &&
//         hasUpperCase &&
//         hasLowerCase &&
//         hasNumbers &&
//         hasSpecialChar,
//     };
//   };

//   const getPasswordStrength = (pwd: string) => {
//     if (!pwd) return { strength: 0, label: '', color: '#ddd' };

//     const validation = validatePassword(pwd);
//     const score = [
//       validation.minLength,
//       validation.hasUpperCase,
//       validation.hasLowerCase,
//       validation.hasNumbers,
//       validation.hasSpecialChar,
//     ].filter(Boolean).length;

//     if (score <= 2) return { strength: score * 20, label: 'Weak', color: '#ff3b30' };
//     if (score === 3) return { strength: score * 20, label: 'Fair', color: '#ff9500' };
//     if (score === 4) return { strength: score * 20, label: 'Good', color: '#ffcc02' };
//     return { strength: 100, label: 'Strong', color: '#34c759' };
//   };

//   const validateForm = () => {
//     let isValid = true;
//     const newErrors = { name: '', email: '', password: '' };

//     if (!isLogin && !name) {
//       newErrors.name = 'Name is required';
//       isValid = false;
//     } else if (!isLogin && name.length < 2) {
//       newErrors.name = 'Name must be at least 2 characters';
//       isValid = false;
//     }

//     if (!email) {
//       newErrors.email = 'Email is required';
//       isValid = false;
//     } else if (!/\S+@\S+\.\S+/.test(email)) {
//       newErrors.email = 'Please enter a valid email';
//       isValid = false;
//     }

//     if (!password) {
//       newErrors.password = 'Password is required';
//       isValid = false;
//     } else if (isLogin && password.length < 6) {
//       newErrors.password = 'Password must be at least 6 characters';
//       isValid = false;
//     } else if (!isLogin && !validatePassword(password).isValid) {
//       newErrors.password = 'Password must meet all security requirements';
//       isValid = false;
//     }

//     setErrors(newErrors);
//     return isValid;
//   };

//   const handleSubmit = () => {
//     if (validateForm()) {
//       navigation.navigate('Connect');
//     }
//   };

//   const resetForm = () => {
//     setName('');
//     setEmail('');
//     setPassword('');
//     setErrors({ name: '', email: '', password: '' });
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Welcome to uniChat</Text>
//       <Text style={styles.subtitle}>Login or sign up to access your account</Text>

//       <View style={styles.tabContainer}>
//         <TouchableOpacity
//           style={[styles.tabButton, isLogin && styles.activeTab]}
//           onPress={() => {
//             setIsLogin(true);
//             resetForm();
//           }}
//         >
//           <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Login</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.tabButton, !isLogin && styles.activeTab]}
//           onPress={() => {
//             setIsLogin(false);
//             resetForm();
//           }}
//         >
//           <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Sign Up</Text>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.form}>
//         {!isLogin && (
//           <View style={styles.inputContainer}>
//             <TextInput
//               style={[styles.input, errors.name && styles.inputError]}
//               placeholder="Full Name"
//               placeholderTextColor={colors.textSecondary}
//               value={name}
//               onChangeText={setName}
//             />
//             {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
//           </View>
//         )}

//         <View style={styles.inputContainer}>
//           <TextInput
//             style={[styles.input, errors.email && styles.inputError]}
//             placeholder="Email Address"
//             placeholderTextColor={colors.textSecondary}
//             value={email}
//             onChangeText={setEmail}
//             keyboardType="email-address"
//             autoCapitalize="none"
//           />
//           {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
//         </View>

//         <View style={styles.inputContainer}>
//           <TextInput
//             style={[styles.input, errors.password && styles.inputError]}
//             placeholder="Password"
//             placeholderTextColor={colors.textSecondary}
//             value={password}
//             onChangeText={(text) => {
//               setPassword(text);
//               if (errors.password) {
//                 setErrors((prev) => ({ ...prev, password: '' }));
//               }
//             }}
//             secureTextEntry={!showPassword}
//           />
//           <TouchableOpacity
//             style={styles.eyeIcon}
//             onPress={() => setShowPassword(!showPassword)}
//           >
//             <Ionicons
//               name={showPassword ? 'eye-off-outline' : 'eye-outline'}
//               size={24}
//               color={colors.textSecondary}
//             />
//           </TouchableOpacity>
//           {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

//           {!isLogin && password && (
//             <View style={styles.passwordStrengthContainer}>
//               <View style={styles.strengthBarContainer}>
//                 <View
//                   style={{
//                     ...styles.strengthBar,
//                     width: `${getPasswordStrength(password).strength}%`,
//                     backgroundColor: getPasswordStrength(password).color,
//                   }}
//                 />
//               </View>
//               <Text style={{ color: getPasswordStrength(password).color }}>
//                 {getPasswordStrength(password).label}
//               </Text>
//             </View>
//           )}

//           {!isLogin && password && (
//             <View style={styles.passwordRequirements}>
//               <Text style={styles.requirementsTitle}>Password must contain:</Text>
//               <View style={styles.requirementsList}>
//                 {([
//                   { label: 'At least 8 characters', key: 'minLength' },
//                   { label: 'One uppercase letter', key: 'hasUpperCase' },
//                   { label: 'One lowercase letter', key: 'hasLowerCase' },
//                   { label: 'One number', key: 'hasNumbers' },
//                   { label: 'One special character (!@#$%^&*)', key: 'hasSpecialChar' },
//                 ] as { label: string; key: PasswordValidationKey }[]).map((req, index) => (
//                   <View key={index} style={styles.requirementItem}>
//                     <Ionicons
//                       name={validatePassword(password)[req.key] ? 'checkmark-circle' : 'close-circle'}
//                       size={16}
//                       color={validatePassword(password)[req.key] ? '#34c759' : '#ff3b30'}
//                     />
//                     <Text
//                       style={{
//                         color: validatePassword(password)[req.key] ? '#34c759' : '#ff3b30',
//                         fontSize: 12,
//                       }}
//                     >
//                       {req.label}
//                     </Text>
//                   </View>
//                 ))}
//               </View>
//             </View>
//           )}
//         </View>

//         {isLogin && (
//           <TouchableOpacity style={styles.forgotPassword}>
//             <Text style={styles.forgotPasswordText}>Forgot password?</Text>
//           </TouchableOpacity>
//         )}

//         <LinearGradient
//           colors={colors.cardGradient}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 1 }}
//           style={styles.submitButtonGradient}
//         >
//           <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
//             <Text style={styles.submitButtonText}>{isLogin ? 'Login' : 'Sign Up'}</Text>
//           </TouchableOpacity>
//         </LinearGradient>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//     padding: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: colors.textPrimary,
//     textAlign: 'center',
//     marginTop: 60,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: colors.textSecondary,
//     textAlign: 'center',
//     marginVertical: 12,
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     marginBottom: 30,
//   },
//   tabButton: {
//     flex: 1,
//     paddingVertical: 16,
//     alignItems: 'center',
//   },
//   activeTab: {
//     borderBottomWidth: 2,
//     borderBottomColor: colors.accent,
//   },
//   tabText: {
//     fontSize: 16,
//     color: colors.textSecondary,
//   },
//   activeTabText: {
//     color: colors.accent,
//     fontWeight: '600',
//   },
//   form: {
//     flex: 1,
//   },
//   inputContainer: {
//     marginBottom: 20,
//     position: 'relative',
//   },
//   input: {
//     height: 50,
//     borderWidth: 1,
//     borderColor: '#333',
//     borderRadius: 8,
//     paddingHorizontal: 15,
//     fontSize: 16,
//     backgroundColor: '#1A1A1A',
//     color: colors.textPrimary,
//   },
//   inputError: {
//     borderColor: colors.error,
//   },
//   errorText: {
//     color: colors.error,
//     fontSize: 12,
//     marginTop: 4,
//     marginLeft: 4,
//   },
//   eyeIcon: {
//     position: 'absolute',
//     right: 15,
//     top: 12,
//   },
//   forgotPassword: {
//     alignSelf: 'flex-end',
//     marginBottom: 20,
//   },
//   forgotPasswordText: {
//     color: colors.accent,
//     fontSize: 14,
//   },
//   submitButtonGradient: {
//     borderRadius: 8,
//     marginTop: 10,
//   },
//   submitButton: {
//     height: 50,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 8,
//   },
//   submitButtonText: {
//     color: colors.textPrimary,
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   passwordStrengthContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     marginTop: 8,
//   },
//   strengthBarContainer: {
//     flex: 1,
//     height: 4,
//     backgroundColor: '#e0e0e0',
//     borderRadius: 2,
//   },
//   strengthBar: {
//     height: 4,
//     borderRadius: 2,
//   },
//   passwordRequirements: {
//     marginTop: 12,
//     padding: 12,
//     backgroundColor: '#1A1A1A',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#333',
//   },
//   requirementsTitle: {
//     fontSize: 12,
//     fontWeight: '600',
//     marginBottom: 8,
//     color: colors.textPrimary,
//   },
//   requirementsList: {
//     gap: 6,
//   },
//   requirementItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//   },
// });
