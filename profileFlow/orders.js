import React, {Component} from 'react';
import {
    Text, FlatList,View,
    ActivityIndicator, Image
} from 'react-native'
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default class orders extends Component{
    constructor(props){
        super(props)
        this.state = {
            items : null
        }
    }


    componentDidMount(){
        let gotItems = [];
        let uid = auth().currentUser.uid
        firestore().collection('People').doc(uid).collection('Orders').get().then( snapshot =>{
            snapshot.forEach(doc => {
                let data = doc.data()
                let dat = data['data']
                let mid = doc.id
                let OS = data['OrderStatus']
                let url = data['Url']
                let data1 = {
                    'mid': mid,
                    'data': dat,
                    'status' : OS,
                    'url': url
                }
                gotItems.push(data1)
            })
            this.setState({ items:gotItems })
        })
    }

    render(){
        if(this.state.items){
        return(
            <View>
                <FlatList
                        data = {this.state.items}
                        keyExtractor = {item => JSON.stringify(item.mid)}
                        renderItem = {({ item, index, separators })=>(
                            <View style={{alignItems:'center'}}>
                                <Text>{'\n'}</Text>
                                <View style={{ borderWidth:1, 
                                               width:'80%', 
                                               flex:1,          
                                               borderColor: 'rgba(39,115,59,1)',
                                               borderBottomRightRadius: 50, 
                                               borderTopLeftRadius: 50,
                                               borderBottomLeftRadius: 5,
                                               borderTopRightRadius: 5, }}>
                                <Image
                                    style={{      
                                        marginTop: 5,
                                        width: 200,
                                        height: 200,
                                        marginBottom:5,
                                        alignSelf: 'center'
                                    }}
                                    key = {1}
                                    resizeMode={"contain"}
                                    source= {{uri: item.url}} 
                                    />
                                    <FlatList 
                                        data = {item.data}
                                        keyExtractor = {item => JSON.stringify(item.cid)}
                                        renderItem = {({item, index,separators })=>(
                                            <View style={{alignItems:'center', borderBottomWidth: 1,borderBottomRightRadius: 100, borderBottomLeftRadius: 100,paddingTop: 20, paddingBottom: 20}}>
                                                <Text style = {{color: "rgb(55,143,40)",fontWeight: 'bold', fontSize: 16}}>Name:<Text style = {{color:'black', fontWeight:'300'}}> {item.cname}</Text></Text>
                                                <Text style = {{color: "rgb(55,143,40)",fontWeight: 'bold', fontSize: 16}}>Quantity: <Text style = {{color:'black', fontWeight:'300'}}>{item.cquan}</Text></Text>
                                                <Text style = {{color: "rgb(55,143,40)",fontWeight: 'bold', fontSize: 16}}>Price:<Text style = {{color:'black', fontWeight:'300'}}> {'\u20B9'}{item.cprice}</Text></Text>
                                            </View>
                                        )}
                                    />

                                <Text style = {{textAlign:  "center", padding: 15, color: "rgb(55,143,40)",fontWeight: 'bold', fontSize: 16}}>Order Status: <Text style = {{color:'black', fontWeight:'300'}}>{item.status}</Text></Text>
                                    </View>
                                <Text>{'\n'}</Text>
                            </View>
                        )}
                    />
            </View>
        )
    }
    else if(this.state.items === []){
        return(<View style = {{flex:1, justifyContent: 'center'}}><Text style = {{textAlign: 'center', fontWeight: 'bold'}}>No Orders Found</Text></View>)
    }
    else{
        return(<View><ActivityIndicator size = 'large' /></View>)
    }
}
}
