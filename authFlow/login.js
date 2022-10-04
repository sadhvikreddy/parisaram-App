import React, { Component } from 'react'
import auth from '@react-native-firebase/auth';
 
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  KeyboardAvoidingView,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet
} from 'react-native'
import CharacterInput from 'react-native-character-input'


export default class Login extends Component{
    constructor(props){
        super(props)
        this.state= {
            userState: null,
            user: null,
            phone: null,
            res : null,
            userId: null,
            verificationCode: null,
            otpStatus: false,
            photoUrl: 'https://firebasestorage.googleapis.com/v0/b/parisaramitrafirebase.appspot.com/o/TrashItems%2FPMLogo.png?alt=media&token=d0aca8d2-2ff2-434c-86ce-602898571e94' 
        }
    }

    async handleSignin(){
      this.setState({otpStatus: "loading"})
      let tok = '+91' + this.state.phone
      await auth().signInWithPhoneNumber(tok)
      .then(confirmResult => { 
        this.setState({res:confirmResult})
        if(confirmResult){
          this.setState({otpStatus: true})
        }
      })
      .catch(error => {alert(error); this.setState({otpStatus: false})})
    }
    

  handleCode = () => {
  
  this.setState({otpStatus: 'loading'})
  let r = this.state.res
  let verificationCode = this.state.verificationCode
  r.confirm(verificationCode)
  .then(user=>{
    if(user){
      setTimeout(()=>{this.setState({otpStatus: false })}, 1000);
    }
  })
  .catch(error => {
      alert(error)
      console.log(error)
      this.setState({ otpStatus:false })
})
}
    render(){
            if (this.state.otpStatus === false){
                return(
                    <SafeAreaView>
                      <KeyboardAvoidingView behavior = 'height' keyboardVerticalOffset = {140}>
                      <View style = {{alignItems: 'center'}}>
                      <Text
                      style={styles.heading}>
                      Login
                      </Text>
                    <Image
                      style={styles.imag}
                      key = {1}
                      resizeMode={"contain"}
                      source= {{uri: this.state.photoUrl}} 
                    />
                    <TextInput
                      placeholder = 'Enter Phone Number'
                      value = {this.state.phone}
                      style = {{ marginBottom: 80, borderBottomWidth: 0.5,textAlign: 'center' }}
                      keyboardType = 'phone-pad'
                      onChangeText = {text => this.setState({ phone:text })}
                    /> 
                    {/* <OutlinedTextField
                    placeholder = 'Enter Phone Number'
                    value = {this.state.phone}
                    style = {{ paddingBottom: 80 }}
                    keyboardType = 'phone-pad'
                    onChangeText = {text => this.setState({ phone:text })} 
                    
                    /> */}
                        <TouchableOpacity
                          onPress = {()=> this.handleSignin()}
                          style = {styles.toucho}
                        >
                            <Text style = {styles.touchotext}>Sign In</Text>
                        </TouchableOpacity>
                        </View>
                        </KeyboardAvoidingView>
                    </SafeAreaView>
                )
            }
            else if(this.state.otpStatus == true){
                return(
                    <SafeAreaView style={{alignItems:'center', flex: 1, justifyContent: 'center'}}>
                      <View style = {{alignItems: 'center'}}>
                      <Text
                      style={styles.heading}>
                      Enter 6-Digit OTP
                    </Text>
                    {/* <Image
                      style={styles.imag}
                      key = {1}
                      resizeMode={"contain"}
                      source= {{uri: this.state.photoUrl}} 
                    /> */}
                    <CharacterInput
                        autoFocus = {true} 
                        showCharBinary = '01111110'
                        placeHolder = ' XXXXXX '
                        inputType = 'underlined'
                        handleChange = {text => this.setState({ verificationCode:text })}
                        keyboardType = 'numeric'
                    />
                    <TouchableOpacity
                      onPress = {()=> this.handleCode()}
                      style = {styles.toucho}
                    >
                        <Text style = {styles.touchotext}>Confirm Code</Text>
                    </TouchableOpacity>
                    </View>
                    </SafeAreaView>
                )
            }
            else if(this.state.otpStatus === "loading"){
              return(
            <SafeAreaView style = {{flex: 1, justifyContent: 'center'}}>
              <ActivityIndicator size = 'large' />
              <Text style = {{textAlign: 'center', fontSize: 16,fontWeight:'bold'}}>LOADING...</Text>
              <Text style = {{textAlign: 'center', fontSize: 16,fontWeight:'200'}}>You maybe be Redirected. Please do not close the Tab</Text>
            </SafeAreaView>
              )
            }
          }
           
}


const styles = StyleSheet.create({
  heading: {
      marginTop: "15%",
      color: "rgb(55,143,40)",
      fontSize: 25,
      fontWeight: "bold",
      alignContent: 'center',
  },
  imag:
    {
      marginTop: 20,
      width: "50%",
      height: "50%",
      marginBottom:25
    },

    toucho: {
      marginLeft: 30,
      marginRight: 30,
      alignItems:'center',
      backgroundColor: 'rgb(55,143,40)', 
      borderBottomRightRadius: 25, 
      borderTopLeftRadius: 25,
      elevation: 5,
      shadowColor: 'rgb(55,143,40)',
      shadowOffset:{width:2, height: 2},
      shadowOpacity: 0.6,
      shadowRadius: 3,
      padding: 10,
      margin: 10
    },
    touchotext: {
      color: 'rgb(255,255,255)',
      fontSize:20
  }
})