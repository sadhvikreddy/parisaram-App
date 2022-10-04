import React, { Component } from 'react'
import { 
    Text,
    FlatList,
    View,
    SafeAreaView,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    Platform,
    ActivityIndicator
} from 'react-native'
import AsyncStorage from '@react-native-community/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Modal from 'react-native-modal'

import ImagePicker from "react-native-image-crop-picker"

import { connect } from 'react-redux'

import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import { Button as B } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';


const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('bag')
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch(e) {
      console.log(e)
    }
  }

  const storeData = async (value) => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem('bag', jsonValue)
    } catch (e) {
      console.log(e)
    }
  }

  const removeValue = async () => {
    try {
      await AsyncStorage.removeItem('bag')
    } catch(e) {
      console.log(e)
    }
  }

class Bag extends Component{
    constructor(props){
        super(props)
        this.state = {
          modalV: false,
          error : '',
          data : null,
          name: null,
          imageUri: null,
          Uploading: false,
          Transfered: null
        }
      }

      componentDidMount(){
        getData().then(data => {
          this.setState({ data })
        })
      }

      removeItem = (item) => {
        let c = this.state.data
        const i = c.findIndex(d => d.cid === item.cid)
        if(i != -1){
          c.splice(i,1)
        }
        this.setState({data: c}) 
        storeData(this.state.data)

        const l = c.length
        
        this.props.dispatch({ type: 'SET_ITEM' , data: l})
      }

      takePhotoFromCamera = () => {
        if(this.state.data){
        ImagePicker.openCamera({
          width: 720,
          height: 720,
          cropping: true,
        }).then((image) => {
          const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
          this.setState({ imageUri })
        }).catch((err) => {
          msg = err.message
          Alert.alert('Error!', msg, [{text:"Retry"}],{cancelable: false})
        });
      }
      else{
        Alert.alert('Oops', 'Please add Items from Home Screen before image Upload!',[{text:"Okay"}],{cancelable: false})
      }
    };
    
    choosePhotoFromLibrary = () => {
      if(this.state.data){
        ImagePicker.openPicker({
          width: 720,
          height: 720,
          cropping: true,
        }).then((image) => {
          const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
          this.setState({ imageUri })
        }).catch((err) => {
          msg = err.message
          Alert.alert('Error!', msg, [{text:"Retry"}],{cancelable: false})
        })
      }
      else{
        Alert.alert('Oops', 'Please add Items from Home Screen before image Upload!',[{text:"Okay"}],{cancelable: false})
      }
      };

      uploadImage = async (userID) => {
        if( this.state.imageUri == null ) {
          return null;
        }
        const uploadUri = this.state.imageUri
        let filename = uploadUri.substring(uploadUri.lastIndexOf('/') + 1);
        const extension = filename.split('.').pop(); 
        const name = filename.split('.').slice(0, -1).join('.');
        filename = name + Date.now() + '.' + extension;
    
        this.setState({ Uploading: true, modalV: true })
        this.setState({ Transfered: 0 })
    
        const storageRef = storage().ref(`orders/${userID}/${filename}`);
        const task = storageRef.putFile(uploadUri);
        task.on('state_changed', (taskSnapshot) => {
          this.setState({ Transfered:
            Math.round(taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) *
              100,
          })
        });
    
        try {
          await task;
    
          const url = await storageRef.getDownloadURL();
    
          this.setState({Uploading: false, modalV: false})
    
          // Alert.alert(
          //   'Image uploaded!',
          //   'Your image has been uploaded to the Firebase Cloud Storage Successfully!',
          // );
          return url;
    
        } catch (e) {
          console.log(e);
          return null;
        }
      };


      placeOrder = async () => {
        let userid = auth().currentUser.uid
        const iUrl = await this.uploadImage(userid);
        const data = {data:this.state.data, Url: iUrl, OrderStatus: 'Order Placed. Awaiting Further Action'}
        firestore().collection('People').doc(userid).collection('Orders').add(data).then(()=>{
          removeValue()
          this.props.dispatch({ type: 'SET_ITEM' , data: 0})
        })
        const msg = "Your Order has been Recieved successfully."
        Alert.alert("Thank you",msg, [{ text: "Okay", onPress: () => this.props.navigation.navigate('Home') }
      ],
      { cancelable: false })
      }

      checkOut = () => {
        if(!this.state.data){
          Alert.alert("Oops!","Can't place empty order!",[{ text: "Okay" }],{ cancelable: false })
        }
        else{ 
          if(this.state.imageUri){
            this.placeOrder()
          }
          else{
            Alert.alert("Oops!","Please Add Image to place Order!",[{ text: "Okay" }],{ cancelable: false })
          }
        }
      }

    render(){
        return(
          <SafeAreaView style = {styles.container}>
            <Text
              style = {styles.headin}  
            >Trash Bag</Text>
              {this.state.imageUri != null ? <Image 
                style = {styles.imag}
              source={{uri: this.state.imageUri}} /> : null}
              {/* <View style = {{ flexDirection: 'row' }}>
                <View style = {{flex: 1}}>
                <B
                      icon={
                        <Icon
                          name="add-a-photo"
                          size={40}
                          color="white"
                        />
                      }
                      style = {styles.Butts}
                      onPress = {this.takePhotoFromCamera}
                    />
                    </View>
                    <View style = {{flex:1}}>
                <B
                      icon={
                        <Icon
                          name="add-photo-alternate"
                          size={40}
                          color="white"
                        />
                      }
                      style = {styles.Butts}
                      onPress = {this.choosePhotoFromLibrary}
                    />
              </View>
              </View>
              
               */}
              
              <FlatList 
                ListHeaderComponent = {
                  <View style = {{flexDirection: "row"}}>
                    <View style = {{flex:1}}>
                      <B 
                        icon = {<Icon 
                            name = "add-a-photo"
                            size = {40}
                            color= "white"
                        />}
                        style = {styles.Butts}
                        onPress = {this.takePhotoFromCamera}
                      />
                    </View>
                    <View style = {{flex:1}}>
                    <B 
                        icon = {<Icon 
                            name = "add-photo-alternate"
                            size = {40}
                            color= "white"
                        />}
                        style = {styles.Butts}
                        onPress = {this.choosePhotoFromLibrary}
                      />
                    </View>
                  </View>
                }
              style = {styles.flc}
              data = {this.state.data}
              keyExtractor = { item => JSON.stringify(item.cid) }
              ListEmptyComponent = {
                <View style = {{margin: 20}}>
                  <Text style = {styles.headin}>Trash Bag is Empty. Add items from Home Screen.</Text>
                </View>
              }
              renderItem = {({ item, index, separators })=>(
                <View style = { styles.listing }>
                <View>
                  <Text style = { styles.texted }> {item.cname}</Text>
                  <Text style = { styles.texted }> {'\u20B9'}{item.cprice} per KG</Text>
                  </View>
                  <View style = {styles.listing1}>
                  <TouchableOpacity
                      style = { styles.toucho2 }
                      onPress = {()=>this.removeItem(item)}
                  >
                    <MaterialCommunityIcons name = "close-box" style={styles.touchotext}/>
                  </TouchableOpacity>
                </View>
                </View>
              )}/>
              <TouchableOpacity
                style = {styles.toucho1}
                onPress = {()=> {
                  this.checkOut()
                }}
              >
                <Text style = { styles.touchotext }>Check Out</Text>
              </TouchableOpacity>
              <Modal
                isVisible = {this.state.modalV}
                style = {{justifyContent: 'flex-end'}}
              >
                <View style = {styles.modal}>
                  <ActivityIndicator size = 'large'/>
                  <Text style = {styles.headin,[textAlign = 'center']}>Placing your Order...</Text>
                </View>
              </Modal>
            </SafeAreaView>
        )
    }
}

const mapStatetoProps = (state) => {
  return {
    Items:state.rebag
  }
}


export default connect(mapStatetoProps)(Bag)


const styles = StyleSheet.create({
  container: {
      alignContent: 'center',
      justifyContent: 'space-evenly',
      width: '100%'
  },
  tcontainer: {
      margin: 20
  },
  headin: {
    fontSize: 30,
    justifyContent: 'center',
    textAlign: 'center',
    marginBottom: 25
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
      borderTopLeftRadius: 0,
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

},
  texted:{
      padding: 10,
      textAlign: 'left',
      fontSize: 17,
      justifyContent: 'center',
      shadowOffset: null,
      shadowOpacity: null,
      shadowColor: null,
      shadowRadius: null,
      color: 'rgba(39, 115, 59,1)'
  },

  flc:{
      margin: 5,
  }, 

  toucho1: {
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
      padding: 10
    },
    toucho2: {
      //alignItems:'center',
      backgroundColor: 'rgba(255,0,0,0.6)', 
      borderBottomRightRadius: 25, 
      borderTopLeftRadius: 25,
      elevation: 5,
      shadowColor: 'rgb(254,0,0)',
      shadowOffset:{width:2, height: 2},
      shadowOpacity: 0.6,
      shadowRadius: 3,
      padding: 10,
      margin: 10
    },
    toucho3: {
      //alignItems:'center',
      backgroundColor: 'rgba(0,0,255,0.6)', 
      borderBottomRightRadius: 25, 
      borderTopLeftRadius: 25,
      elevation: 5,
      shadowColor: 'rgb(0,0,254)',
      shadowOffset:{width:2, height: 2},
      shadowOpacity: 0.6,
      shadowRadius: 3,
      padding: 10,
      margin: 10
    },
    touchotext: {
      color: '#fff',
      fontSize:20
    },
    imag: {
      width: '100%',
      height: 250,
      marginBottom: 25,
    },
    Butts: {
      margin: 10,
      borderBottomRightRadius: 50, 
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 50,
      borderTopRightRadius: 5,
    },
    modal: {  
      padding: 10,
      justifyContent: 'center',  
      alignItems: 'center',   
      backgroundColor : "rgba(255,255,255,0.95)",
     // flex: 1,

      borderWidth: 1,  
      borderColor: 'rgb(255,255,255)',
      
      borderBottomRightRadius: 25, 
      borderTopLeftRadius: 25,
      borderBottomLeftRadius: 5,
      borderTopRightRadius: 5,
       }
})  