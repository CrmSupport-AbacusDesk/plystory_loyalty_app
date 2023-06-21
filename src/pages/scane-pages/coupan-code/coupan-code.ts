import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { DbserviceProvider } from '../../../providers/dbservice/dbservice';
import { TabsPage } from '../../tabs/tabs';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { HomePage } from '../../home/home';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Geolocation } from '@ionic-native/geolocation';


@IonicPage()
@Component({
  selector: 'page-coupan-code',
  templateUrl: 'coupan-code.html',
})
export class CoupanCodePage {
  
  qr_code:any='';
  data:any={};
  flag:any='';
  
  constructor(public navCtrl: NavController, public navParams: NavParams,public service:DbserviceProvider,public alertCtrl:AlertController,private barcodeScanner: BarcodeScanner,public locationAccuracy: LocationAccuracy, public geolocation: Geolocation) {
  }
  
  ionViewDidLoad() {
    console.log('ionViewDidLoad CoupanCodePage');
  }
  
  lat:any;
  long:any;

  submit(data)
  {

    
    this.flag=1;
    this.qr_code=data;
    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
    .then(() => {
        let options = {
            maximumAge: 10000, timeout: 15000, enableHighAccuracy:true
        };
        this.geolocation.getCurrentPosition(options)
        .then((resp) => {
            this.lat = resp.coords.latitude
            this.long = resp.coords.longitude
            console.log(this.lat + 'lat');
            console.log(this.lat + 'long');

            
            if(this.lat == null && this.long == null){
                console.log("null lat",this.lat);
            } 
            else{
              this.service.post_rqst({'karigar_id':this.service.karigar_id,'qr_code':this.qr_code,'coupon_lat':this.lat , 'coupon_long' : this.long},'app_karigar/karigarCoupon').subscribe((r:any)=>
                {
                  console.log(r);
                  
                  if(r['status'] == 'BLANK'){
                    this.showAlert("This Coupon Code doesn't contain any Value");
                    return;
                  }
                  else if(r['status'] == 'INVALID'){
                    this.showAlert("Invalid Coupon Code");
                    return;
                  }
                  else if(r['status'] == 'REQUIRED'){
                    this.showAlert("Please Enter Coupon Code");
                    return;
                  }
                  else if(r['status'] == 'USED'){
                    this.showAlert("Coupon Already Used");
                    return;
                  }
                  else if(r['status'] == 'UNASSIGNED OFFER'){
                    this.showAlert("Your Account Under Verification");
                    return;
                  }
                  this.showSuccess( r['coupon_value'] +" points has been added into your wallet")
                  // this.navCtrl.setRoot(TabsPage,{index:'0'});
                  this.navCtrl.push(HomePage);
                });
            }  
        },
        error => {
            console.log('Error requesting location permissions', error);
            if(error){
                let alert = this.alertCtrl.create({
                    title:'Alert!',
                    cssClass:'action-close',
                    subTitle:"Enable to get your location so, can't scan",
                    buttons: ['OK']
                });
                alert.present();  
            }
            
        });
    });
  
  }
  scan()
  {
    
    this.barcodeScanner.scan().then(resp => {
      console.log(resp);
      this.qr_code=resp.text;
      console.log( this.qr_code);
      if(resp.text != '')
      {
        this.service.post_rqst({'karigar_id':this.service.karigar_id,'qr_code':this.qr_code},'app_karigar/karigarCoupon').subscribe((r:any)=>
        {
          console.log(r);
          
          if(r['status'] == 'INVALID'){
            this.showAlert("Invalid Coupon Code");
            return;
          }
          else if(r['status'] == 'USED'){
            this.showAlert("Coupon Already Used");
            return;
          }
          else if(r['status'] == 'UNASSIGNED OFFER'){
            this.showAlert("Invalid Coupon Code");
            return;
          }
          else if(r['status'] == 'REQUIRED'){
            this.showAlert("Please Enter the coupon code ");
            return;
          }
          this.showSuccess( r['coupon_value'] +" points has been added into your wallet")
          // this.navCtrl.setRoot(TabsPage,{index:'0'});
          this.navCtrl.push(TabsPage);
        });
      }
      else
      {
        console.log('not scanned anything');
      }
    });      
  }
  showAlert(text)
  {
    let alert = this.alertCtrl.create({
      title:'Alert!',
      cssClass:'action-close',
      subTitle: text,
      buttons: ['OK']
    });
    alert.present();
  }
  showSuccess(text)
  {
    let alert = this.alertCtrl.create({
      title:'Success!',
      cssClass:'action-close',
      subTitle: text,
      buttons: ['OK']
    });
    alert.present();
  }
}
