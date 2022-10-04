import React, { Component } from 'react'
import {
    View,
    Text,
    StyleSheet, 
    TouchableOpacity, 
    DevSettings, 
    SafeAreaView, 
    Linking, 
    Button, 
    Alert
} from 'react-native'
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {
  OutlinedTextField
}
from 'react-native-material-textfield-plus'
//import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
//import Geolocation from '@react-native-community/geolocation';


export default class profile extends Component{
    constructor(props){
        super(props)
        this.state ={
            name: null,
            email: null,
            phone: null,
            Pincode: null,
            mode: 'view',
            userid: null,
            address: null,
            location: null,
            marker: null,
            modalV : false,
            wtw: null
        }
    }
    saveidb(){
        firestore().collection('People').doc(this.state.userid).update(
            {'Name': this.state.name,
            'Email' : this.state.email,
            'UpiID' : this.state.address,
            'What3Words': this.state.wtw,
            'PinCode': this.state.Pincode
        })
        this.setState({ mode: 'view' })
    }

    done(){
      const phoneNumb = 9035881005
      Linking.openURL(`tel:${phoneNumb}`);
    }
    done1(){
      const email = 'admin@parisaram.com'
      Linking.openURL(`mailto:${email}`);
    }

    signOut(){
        auth().signOut()
        DevSettings.reload()
    }

    orders(){
      this.props.navigation.push('Orders');
    }

    getWtw = () => {
      const msg = 'what3words is an easy way to identify precise locations. Every 3m square has been given a unique combination of three words: a what3words address. Now you can find, share and navigate to precise locations using three simple words. COPY WHAT3WORDS OF THE DESIRED LOCATION AND PASTE HERE'
      Alert.alert("ABOUT WHAT3WORDS",msg,
      [
        {
          text: "NO, I KNOW MY WHAT3WORDS",
          onPress: () => {return null},
          style: "cancel"
        },
        { text: "GO TO WHAT3WORDS ->", onPress: () => {      
          const url = 'w3w://show?currentlocation'
        Linking.openURL(url).catch(err => {
          const url1 = 'https://what3words.com/'
          Linking.openURL(url1)
        })} }
      ]
      )
      // Geolocation.getCurrentPosition(
      //         (position) => {
      //           let location = {
      //             latitude : position.coords.latitude,
      //             longitude: position.coords.longitude,
      //             latitudeDelta: 0.01,
      //             longitudeDelta: 0.01
      //           }
                
      //           setLocation(location)
      //   }
      // )
      // setModalV(true)
    }

    // changeMarker(position){
    //     let marker = {
    //         latitude : position.coordinate.latitude,
    //         longitude: position.coordinate.longitude,
    //       }
    //       this.setState({ marker })
    // }

    componentDidMount(){
            let user = auth().currentUser
            let userid = user.uid
            this.setState({ userid })
            this.setState({ phone:user.phoneNumber })
            const swear = firestore().collection('People').doc(userid).get()
            if(swear){
                swear.then(snapshot => 
                 { if(snapshot){
                  this.setState({ name:snapshot.data()['Name'],Pincode:snapshot.data()['PinCode'],email:snapshot.data()['Email'],address:snapshot.data()['UpiID'],wtw:snapshot.data()['What3Words']})
            }})}
          //  Geolocation.getCurrentPosition(
          //       (position) => {
          //         let location1 = {
          //           latitude : position.coords.latitude,
          //           longitude: position.coords.longitude,
          //           latitudeDelta: 0.01,
          //           longitudeDelta: 0.01
          //         }
          //         let x ={
          //             coordinate:{latitute:position.coords.latitude,longitude:position.coords.longitude}
          //         }
          //         this.changeMarker(x)
                  
          //         this.setState({ location : location1 })
          //       }
          //     )
    }

    render(){
          if( this.state.mode == 'view' ){
            return(
                <SafeAreaView style = {styles.container}>
                  <View style = {styles.wrapper}>
                   {/* <View style={styles.container}>
                        <MapView
                            provider={PROVIDER_GOOGLE}
                            style={styles.map}
                            initialRegion={this.state.location}
                            customMapStyle = {mapstyle}
                        >
                             <Marker
                                    coordinate={{ latitude: this.state.location.latitude, 
                                    longitude: this.state.location.longitude }}/>
                        </MapView>
                    </View> */}
                    {/* <Text style = {styles.headin}>Profile</Text> */}
                    <View style = {{
                    padding: 20, 
                    margin: 10,
                    borderWidth: 0.5,          
                    borderBottomRightRadius: 50, 
                    borderTopLeftRadius: 50,
                    borderBottomLeftRadius: 5,
                    borderTopRightRadius: 5, 
                    borderColor: "rgb(55,143,40)"
          }}>
                <Text style = {styles.headin}>Profile</Text>
                    <Text style = {{color: "rgb(55,143,40)",fontWeight: 'bold', fontSize: 16}}>Name: <Text style = {{color:'black', fontWeight:'300'}}>{this.state.name}</Text></Text>
                    <Text style = {{color: "rgb(55,143,40)",fontWeight: 'bold', fontSize: 16}}>Phone: <Text style = {{color:'black', fontWeight:'300'}}>{this.state.phone}</Text></Text>
                    <Text style = {{color: "rgb(55,143,40)",fontWeight: 'bold', fontSize: 16}}>Email: <Text style = {{color:'black', fontWeight:'300'}}>{this.state.email}</Text></Text>
                    <Text style = {{color: "rgb(55,143,40)",fontWeight: 'bold', fontSize: 16}}>UPI ID:<Text style = {{color:'black', fontWeight:'300'}}> {this.state.address}</Text></Text>
                    <Text style = {{color: "rgb(55,143,40)",fontWeight: 'bold', fontSize: 16}}>What3Words:<Text style = {{color:'black', fontWeight:'300'}}> {this.state.wtw}</Text></Text>
                    <Text style = {{color: "rgb(55,143,40)",fontWeight: 'bold', fontSize: 16}}>Pincode: <Text style = {{color:'black', fontWeight:'300'}}>{this.state.Pincode}</Text></Text>
                    <TouchableOpacity
                      style = {styles.toucho1}
                      onPress = {() => {this.setState({mode: 'edit'})}}
                    >
                      <Text style = {styles.touchotext}>Edit Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style = {styles.toucho3}
                      onPress = {() => {this.orders()}}
                    >
                      <Text style = {styles.touchotext}>Orders</Text>
                    </TouchableOpacity>
                    </View>
                    <View>
                    <Text style = {styles.headin}>Get Support</Text>
                      <View style = {{flexDirection: 'row', alignSelf: 'center', padding: 10, margin: 10}}>
                    <TouchableOpacity
                      style = {styles.toucho4}
                      onPress = {() => {this.done()}}
                    >
                      <Text style = {styles.touchotext}>Call </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style = {styles.toucho4}
                      onPress = {() => {this.done1()}}
                    >
                      <Text style = {styles.touchotext}>Email</Text>
                    </TouchableOpacity>
                    </View>
                    </View>
                    <View>
                    <TouchableOpacity
                      style = {styles.toucho2}
                      onPress = {() => {this.signOut()}}
                    >
                      <Text style = {styles.touchotext}>Sign Out</Text>
                    </TouchableOpacity>
                    </View>
                    </View>
                  </SafeAreaView>
            )
        }
        else if(this.state.mode == 'edit'){
            return(
              <View style = {{margin: 20}}>
                                    {/* <TextInput
                        placeholder = {this.state.name} 
                        style = {{ borderWidth: 1, borderRadius:5, margin: '3%', padding: '1%'  }}
                        value = {this.state.name}
                        onChangeText = {(text) => this.setState({name1:text})}
                    /> */}
                    <OutlinedTextField
                            label = "Name"
                            value = {this.state.name}
                            onChangeText = {(text) => this.setState({ name: text})}

                        /> 
                    {/* <TextInput
                        placeholder = {this.state.email}
                        style = {{ borderWidth: 1, borderRadius:5, margin: '3%', padding: '1%'  }}
                        value = {this.state.email}
                        onChangeText = {(text) => this.setState({email1:text})}
                    /> */}
                  <OutlinedTextField
                            label = "Email"
                            keyboardType = 'email-address'
                            value = {this.state.email}
                            onChangeText = {(text) => this.setState({ email: text})}

                        /> 
                    {/* <TextInput
                        placeholder = {this.state.address}
                        multiline = {true}
                        style = {{ borderWidth: 1, borderRadius:5, margin: '3%', padding: '1%',height: 100  }}
                        value = {this.state.address}
                        onChangeText = {(text) => this.setState({address1:text})}
                    /> */}
                    <OutlinedTextField 
                      label = 'UPI ID'
                      value = {this.state.address}
                      onChangeText = {(text) => this.setState({ address: text})}/>
                    {/* <TextInput
                        placeholder = {this.state.Pincode}
                        style = {{ borderWidth: 1, borderRadius:5, margin: '3%', padding: '1%'  }}
                        value = {this.state.Pincode}
                        onChangeText = {(text) => this.setState({Pincode1:text})}
                    /> */}
                    <OutlinedTextField
                      label = "WHAT3WORDS"
                      value = {this.state.wtw}
                      onChangeText = {(text) => this.setState({wtw: text})}
                      rendeLeftAccessory = {()=>{
                      return(<Text style = {{fontWeight: 'bold'}}>/// 
                      </Text>)
                    }}
                    renderRightAccessory = {()=>{
                      return(<Button title = 'Need help?' onPress = {()=> this.getWtw()} />)
                    }}
                  /> 
                    <OutlinedTextField
                      label = "Pin Code"
                      value = {JSON.stringify(this.state.Pincode)}
                      keyboardType='number-pad'
                      onChangeText = {(text) => this.setState({ Pincode: parseInt(text)})}
                  />
                  <View style = {{flexDirection:'row'}}>
                  <TouchableOpacity
              style = {[styles.toucho2,{flex:1,marginLeft:5,marginRight:5}]}
              onPress = {() => {this.setState({mode:'view'})}}
            >
              <Text style = {styles.touchotext}>back</Text>
            </TouchableOpacity>
              <TouchableOpacity
              style = {[styles.toucho1,{flex: 1,marginLeft:5,marginRight:5}]}
              onPress = {() => {this.saveidb()}}
            >
              <Text style = {styles.touchotext}>Save</Text>
            </TouchableOpacity>
            </View>
            </View>
            )
        }
    }
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      height: '100%'
    },
    wrapper: {
      flex: 1,
      justifyContent: 'center'
    },
    map: {
      ...StyleSheet.absoluteFillObject
    },
      tcontainer: {
          margin: 20
      },
      headin: {
        fontSize: 30,
        justifyContent: 'center',
        textAlign: 'center'
      },
      listing: {
          flex: 1,
    
        //  backgroundColor: 'rgba(39, 115, 59,1)',
          justifyContent: 'space-between',
          flexDirection: 'row',
    
          padding:  15, 
          margin: 5,
    
          borderWidth: 0.5,
          borderLeftWidth:0,
          borderRightWidth:0,
          borderTopWidth:0,
          borderColor: 'rgba(39,115,59,1)',
    
    
          borderBottomRightRadius: 50, 
          borderTopLeftRadius: 5,
          borderBottomLeftRadius: 50,
          borderTopRightRadius: 5,
    
          shadowOffset: {width: -3, height: -3},
          shadowOpacity: 0.5,
          shadowColor: 'rgb(187,232,181)',
          shadowRadius: 5,
    
      },
      listing1: {
        flex: 1,
    
      //  backgroundColor: 'rgba(39, 115, 59,1)',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding:  15, 
        margin: 5,
    
    
        borderBottomRightRadius: 50, 
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 50,
        borderTopRightRadius: 5,
    
        shadowOffset: {width: -3, height: -3},
        shadowOpacity: 0.5,
        shadowColor: 'rgb(187,232,181)',
        shadowRadius: 5,
        elevation: 10
    
    },
      texted:{
          margin: 12,
          padding: 12,
          textAlign: 'left',
          fontSize: 16,
          justifyContent: 'center',
          borderBottomWidth: 1,
          borderRightWidth: 0.5,
          borderBottomRightRadius: 50,
      },
    
      flc:{
          margin: 5,
      }, 
    
      toucho1: {
          // marginLeft: 30,
          // marginRight: 30,
          alignItems:'center',
          backgroundColor: 'rgba(55,143,40,0.9)', 
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
        toucho2: {
          marginLeft: 30,
          marginRight: 30,
          alignItems:'center',
          backgroundColor: 'rgba(255,0,0,0.6)', 
          borderBottomRightRadius: 25, 
          borderTopLeftRadius: 25,
          shadowColor: 'rgb(254,0,0)',
          shadowOffset:{width:2, height: 2},
          shadowOpacity: 0.6,
          shadowRadius: 3,
          padding: 10,
          margin: 10
        },
        toucho3: {
          alignItems:'center',
          backgroundColor: 'rgba(0,0,255,0.6)', 
          borderBottomRightRadius: 25, 
          borderTopLeftRadius: 25,
          shadowColor: 'rgb(0,0,254)',
          shadowOffset:{width:2, height: 2},
          shadowOpacity: 0.6,
          shadowRadius: 3,
          padding: 10,
          margin: 10
        },
        toucho4: {
          alignItems:'center',
          backgroundColor: 'rgba(39,115,59,1)', 
          borderBottomRightRadius: 25, 
          borderTopLeftRadius: 25,
          shadowColor: 'rgb(39,115,59)',
          shadowOffset:{width:2, height: 2},
          shadowOpacity: 0.6,
          shadowRadius: 3,
          width: '40%',
          margin: 10,
          padding: 10
        },
        touchotext: {
          color: '#fff',
          fontSize:20
        }
    });