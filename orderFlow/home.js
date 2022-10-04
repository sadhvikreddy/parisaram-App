import React, { Component } from 'react';
import {
    TouchableOpacity,
    ActivityIndicator,
    Text,
    View,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Alert,
    Image,
    ImageBackground
}
from 'react-native';
import Modal from 'react-native-modal'

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import AsyncStorage from '@react-native-community/async-storage';

import { connect } from 'react-redux'

// async function geturl(){
//     const downloadUrl =  await storage().ref('TrashItems/PMLogo.png').getDownloadURL();
//     console.log(downloadUrl)
// }

async function getItems(){
    let gotItems = []
    await firestore().collection("trashItems")
        .get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                const ID = doc.id;
                const info = doc.data();
                const Name = info['Name']
                const Price = info['Price']
                const Url = info['ImageUrl']
                const Ratio = info['Ratio']
                const item = {
                    ID,
                    Name,
                    Price,
                    Url,
                    Ratio
                }
                gotItems.push(item)
            })
        })
        .catch(
            err => {console.log("Error fetching data", err);
        })
        
    return gotItems
}

const storeData = async (value) => {
    try {
      const jsonValue = JSON.stringify(value)  
      await AsyncStorage.setItem('bag', jsonValue)
    } catch (e) {
      console.log(e)
    }
  }

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('bag')
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch(e) {
        console.log(e)
    }
  }


class Home extends Component{
    constructor(props){
        super(props)
        this.state = {
            username: '', 
            number : null,
            items : [],
            isLoaded: false,
            modalV : false,
            currItem: [],
            order: [],
            orderids: [],
            isImageLoaded: false,
            ratio: null,
            upincode: 9999,
            pincodes: [],
            showText: false
       }
    }


    formatOrder = () => {
        //AsyncStorage.clear()
        const tempid = this.state.orderids
        const temp = this.state.order
        const cid = this.state.currItem['ID']
        const cname = this.state.currItem['Name']
        const cprice = this.state.currItem['Price']
        const cquan = 0
        if(!(tempid.includes(cid))){
            let item = {
                cid,cname,cprice,cquan
            }
            temp.push(item)
            storeData(temp)

            const l = temp.length
            
            this.setState({modalV:false, isImageLoaded: false})
            this.props.dispatch({ type: 'SET_ITEM' , data: l})
            Alert.alert('','Item Added')
        }
        else{
            Alert.alert('','Already in bin!')
            this.setState({modalV:false, isImageLoaded: false})
        }
    }


    showInfo = (item) => {
        let x1 = []
        let x = this.state.order
        let ratio = item.Ratio
        x.forEach(data =>{
            let id = data['cid']
            if(!(x1.includes(id)))
                x1.push(id)
        })

        console.log(x)

        this.setState({ ratio })

        this.setState({
            orderids: x1,
            modalV: true,
            currItem: item
        })
    }
    
    createList = (item) => {
        return(
        <TouchableOpacity
        onPress = {()=>{
            this.showInfo(item) 
        }}
        style={ styles.listing }>
            <Text style = {styles.texted}>{item.Name}</Text>
            <Text style = {styles.texted}> {'\u20B9'}{item.Price} per KG</Text>
        </TouchableOpacity>
        );
    }

    componentDidMount(){
        let user =  auth().currentUser
        if(user){
        let uid = user.uid
        const uname = firestore().collection('People').doc(uid).get()
        if(uname){
            uname.then(snapshot => {this.setState({ username:snapshot.data()['Name'], upincode:snapshot.data()['PinCode']})})
        }
    }
    firestore().collection("Settings")
        .doc('Application')
        .get()
        .then(snapshot => {
           let x = snapshot.data()['pincodes']
           this.setState({pincodes: x})
            })

        getData().then( data => {
            if(data != null){
                this.setState({order: data})
            }
        }).catch(err=>console.log(err));
        getItems().then(
            (data) => {
                this.setState({
                    items: data,
                    isLoaded: true
                })
        }).catch(err=>console.log(err));
        setTimeout(() => {
            this.setState({ showText: true })
          }, 3000)
    }


    render(){
        if(this.state.upincode === 9999){
            return(
                <SafeAreaView style = {{flex: 1, justifyContent: 'center'}}>
                    <Text style = {styles.headin}>LOADING</Text>
                </SafeAreaView>
                )
            }
        else if(!(this.state.pincodes.includes(this.state.upincode))){
            return(
            <SafeAreaView style = {{flex: 1, justifyContent: 'center'}}>
                {this.state.showText && <Text style = {styles.headin}>Sorry, Parisara Mitra is not operational in given pincode{'\n\n'}<Text style = {{color: 'red'}}> Your Pincode: {this.state.upincode}.</Text> {'\n\n'} <Text style = {{color: 'blue'}}>Go to settings and Change Pin Code</Text></Text>}  
            </SafeAreaView>
            )
        }
        else{
        if(this.state.isLoaded == true){
            return(
                <SafeAreaView>
                    <View style = {styles.container}>
                    <View style = {styles.tcontainer}>
                    <Text
                        style = {styles.headin}
                    >Hello {this.state.username}</Text>
                    </View>
                    <View style = {styles.flc}>
                    <FlatList
                        showsVerticalScrollIndicator ={false}
                        data = {this.state.items}
                        keyExtractor = {item => JSON.stringify(item.ID)}
                        renderItem = {({ item, index, separators })=>(
                            this.createList(item)
                        )}
                    />
                    </View>
                    </View>
                    <Modal
                    transparent = {true}
                    isVisible = {this.state.modalV}
                    animationIn = 'slideInUp'
                    animationOut = 'slideOutDown'
                    style = {{margin: 0, justifyContent: 'flex-end'}}
                    >
                        <View style = {styles.modal}> 
                        <View style = {{paddingTop: 35}}>
                            <View>
                            <Image
                            onLoad = { () => this.setState({ isImageLoaded: true }) }
                            style = {{
                    width: 300,
                    height: 300 * this.state.ratio
                }}
                source = {{uri: this.state.currItem.Url}}
                resizeMode = 'contain'
            /> 
            <ActivityIndicator
                size = 'large'
                style = {{ display: (this.state.isImageLoaded ? 'none' : 'flex') }}
            />
            </View>
                            <Text style = {styles.headin1}>{this.state.currItem.Name}</Text>
                            <Text style = {styles.headin1}>{'\u20B9'}{this.state.currItem.Price} per KG</Text>
                        </View>
                        <View style = {{flexDirection: 'row',marginBottom:35,marginTop: 35}}>
                        <TouchableOpacity 
                            style = {styles.toucho1}
                            onPress = {()=> {this.formatOrder()}}
                            >

                            <Text style = {styles.touchotext}>Add to Trash Bag</Text>
                            
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style = {styles.toucho2}
                            onPress = {() =>{this.setState({modalV:false,isImageLoaded: false})}}
                        >
                        <Text style = {styles.touchotext}>Cancel</Text>                       
                        </TouchableOpacity>
                        </View>
                        </View>
                    </Modal>
                </SafeAreaView>

            )
        }
        else{
            return(
                <SafeAreaView style = {{flex: 1, justifyContent: 'center'}}>
                    <ActivityIndicator size = 'large' />
                </SafeAreaView>
            )
        }
    }
}
}


const mapStatetoProps = (state) => {
    return {
        bagCount: state.rebag
    }
}


export default connect(mapStatetoProps)(Home)


const styles = StyleSheet.create({
    container: {
        alignContent: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '94%'
    },
    tcontainer: {
        margin: 20
    },
    headin: {
      fontSize: 30,
      justifyContent: 'center',
      textAlign: 'center',
      paddingTop: 100
    },
    headin1: {
        fontSize: 20,
        margin: 5,
        justifyContent: 'center',
        textAlign: 'center',
       // marginTop: 50
      },
    listing: {
        flex: 1,

      //  backgroundColor: 'rgba(39, 115, 59,1)',
        alignItems:'center',
        justifyContent: 'center',

        padding:  15, 
        margin: 5,

        borderWidth: 0.5,
        borderLeftWidth:0,
        borderRightWidth:0,
        borderTopWidth:0,


        borderBottomRightRadius: 100, 
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 100,
        borderTopRightRadius: 5,

        shadowOffset: {width: -3, height: -3},
        shadowOpacity: 0.5,
        shadowColor: 'rgb(187,232,181)',
        shadowRadius: 5,

    },
    texted:{
        padding: 10,
        textAlign: 'center',
        fontSize: 17,
        justifyContent: 'center',
        shadowOffset: null,
        shadowOpacity: null,
        shadowColor: null,
        shadowRadius: null,
       // color: 'white'
    },
    texted1:{
        padding: 10,
        textAlign: 'center',
        fontSize: 17,
        justifyContent: 'center',
        color: 'black'
    },
    flc:{
        margin: 10,
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
         },  

    toucho1: {
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
      toucho2: {
        alignItems:'center',
        backgroundColor: 'rgba(255,0,0,0.6)', 
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
        color: '#fff',
        fontSize:20
      }
})  