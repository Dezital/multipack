import { Button, Card, Tabs } from "@shopify/polaris";
import React, { useEffect, useState } from "react";
import { useCallback } from "react";
import { MobileBackArrowMajor } from "@shopify/polaris-icons";
import FormsAddTags from "./FormsAddTags";
import ShippinfCarrier from "./ShippingCarrier";
import AdvanceCheckbox from "./AdvanceCheckbox";
import store from "store-js";
import PartialFormTags from "./PartialFormTags";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { useAppBridge } from "@shopify/app-bridge-react";

import TopHeader from "./TopHeader";

function SettingsPage({
  setActiveHelp,
  setActiveHome,
  activehelp,
  activehome,
  setSettings,
  setting,
  userHistory,
}) {

 
  console.log("uerhistory", userHistory);
  const [selected, setSelected] = useState(0);
  const [loaded, setLoaded] = useState(true);
  const [products, setProducts] = useState();
  const app = useAppBridge();
  const [isdata, setisdata] = useState(true);
  const arr = [
    {

      id: 1,
      multipack_name: '"character Choices" Argus Poster Combo Pack,-8Packs',
      multipack_id: 2147483647,
      multipack_price: 144,
      multipack_img:
        "https://cdn.shopify.com/s/files/1/0553/1690/6057/products/ESTEPTA67913.jpg?v=1656081541",
      multipack_qty: 7,
      multipack_varient_id: "40047526379593",
      multipack_varient_sku: "TEPTA67913-7Packs",
      multipack_varient_barcode: "078628679137",
      multipack_varient_weight: "5.6088",
      product_id: 2147483647,
      product_varient_id: 2147483647,
      created_at: "toady",
      updated_at: "yesterday",
      product_varient_quantity: "54",
      product_varient_sku: "Sku",
      setSchedule: 0,
    },
    {
      id: 2,
      multipack_name: '"character Choices" Argus Poster Combo Pack,-6Packs',
      multipack_id: 2147483647,
      multipack_price: 108,
      multipack_img:
        "https://cdn.shopify.com/s/files/1/0553/1690/6057/products/ESTEPTA67913.jpg?v=1656081541",
      multipack_qty: 9,
      multipack_varient_id: "40047534014537",
      multipack_varient_sku: "TEPTA67913-6Packs",
      multipack_varient_barcode: "078628679137",
      multipack_varient_weight: "4.2066",
      product_id: 2147483647,
      product_varient_id: 2147483647,
      created_at: "toady",
      updated_at: "yesterday",
      product_varient_quantity: "54",
      product_varient_sku: "Sku",
      setSchedule: 0,
    },
    {
      id: 3,
      multipack_name: '"character Choices" Argus Poster Combo Pack,-10Packs',
      multipack_id: 2147483647,
      multipack_price: 97,
      multipack_img:
        "https://cdn.shopify.com/s/files/1/0553/1690/6057/products/ESTEPTA67913.jpg?v=1656081541",
      multipack_qty: 5,
      multipack_varient_id: "40047546073161",
      multipack_varient_sku: "TEPTA67913-10Packs",
      multipack_varient_barcode: "078628679137",
      multipack_varient_weight: "7.010999999999999",
      product_id: 2147483647,
      product_varient_id: 2147483647,
      created_at: "toady",
      updated_at: "yesterday",
      product_varient_quantity: "54",
      product_varient_sku: "Sku",
      setSchedule: 0,
    },
    {
      id: 4,
      multipack_name: '"character Choices" Argus Poster Combo Pack,-10Packs',
      multipack_id: 2147483647,
      multipack_price: 97,
      multipack_img:
        "https://cdn.shopify.com/s/files/1/0553/1690/6057/products/ESTEPTA67913.jpg?v=1656081541",
      multipack_qty: 5,
      multipack_varient_id: "40047546105929",
      multipack_varient_sku: "TEPTA67913-10Packs",
      multipack_varient_barcode: "078628679137",
      multipack_varient_weight: "7.010999999999999",
      product_id: 2147483647,
      product_varient_id: 2147483647,
      created_at: "toady",
      updated_at: "yesterday",
      product_varient_quantity: "54",
      product_varient_sku: "Sku",
      setSchedule: 0,
    },
    {
      id: 5,
      multipack_name: '"character Choices" Argus Poster Combo Pack,-4Packs',
      multipack_id: 2147483647,
      multipack_price: 243,
      multipack_img:
        "https://cdn.shopify.com/s/files/1/0553/1690/6057/products/ESTEPTA67913.jpg",
      multipack_qty: 14,
      multipack_varient_id: "40047554265161",
      multipack_varient_sku: "TEPTA67913-4Packs",
      multipack_varient_barcode: "078628679137",
      multipack_varient_weight: "2.8044",
      product_id: 2147483647,
      product_varient_id: 2147483647,
      created_at: "toady",
      updated_at: "yesterday",
      product_varient_quantity: "54",
      product_varient_sku: "Sku",
      setSchedule: 0,
    },
    {
      id: 6,
      multipack_name: '"character Choices" Argus Poster Combo Pack,-2Packs',
      multipack_id: 2147483647,
      multipack_price: 486,
      multipack_img:
        "https://cdn.shopify.com/s/files/1/0553/1690/6057/products/ESTEPTA67913.jpg",
      multipack_qty: 27,
      multipack_varient_id: "40047557967945",
      multipack_varient_sku: "TEPTA67913-2Packs",
      multipack_varient_barcode: "078628679137",
      multipack_varient_weight: "1.4022",
      product_id: 2147483647,
      product_varient_id: 2147483647,
      created_at: "toady",
      updated_at: "yesterday",
      product_varient_quantity: "54",
      product_varient_sku: "Sku",
      setSchedule: 0,
    },
    {
      id: 7,
      multipack_name:
        '"sign Here" Page Flag Dispenser Refill Rolls, 0.56" Wide, Red, 120-roll, 2 Rolls-pack-10Packs',
      multipack_id: 2147483647,
      multipack_price: 214,
      multipack_img:
        "https://cdn.shopify.com/s/files/1/0553/1690/6057/products/ESRTG93022.jpg",
      multipack_qty: 22,
      multipack_varient_id: "40047617638473",
      multipack_varient_sku: "RTG93022-10Packs",
      multipack_varient_barcode: "012534930227",
      multipack_varient_weight: "1.19",
      product_id: 2147483647,
      product_varient_id: 2147483647,
      created_at: "toady",
      updated_at: "yesterday",
      product_varient_quantity: "222",
      product_varient_sku: "Sku",
      setSchedule: 0,
    },
    {
      id: 8,
      multipack_name:
        '"sign Here" Page Flag Dispenser Refill Rolls, 0.56" Wide, Red, 120-roll, 2 Rolls-pack-5Packs',
      multipack_id: 2147483647,
      multipack_price: 425,
      multipack_img:
        "https://cdn.shopify.com/s/files/1/0553/1690/6057/products/ESRTG93022.jpg",
      multipack_qty: 5,
      multipack_varient_id: "40052875165769",
      multipack_varient_sku: "RTG93022-5Packs",
      multipack_varient_barcode: "012534930227",
      multipack_varient_weight: "5.236",
      product_id: 2147483647,
      product_varient_id: 2147483647,
      created_at: "toady",
      updated_at: "yesterday",
      product_varient_quantity: "222",
      product_varient_sku: "RTG93022-5Packs",
      setSchedule: 0,
    },
  ];
 const handleDeleteButton=async(input)=>{
  console.log("hello")
  console.log(input.value.multipack_id)
  const multipackid=input.value.multipack_id

  const token = await getSessionToken(app);
  const res = await fetch("/deleteProduct", {
    method: "POST",
    body: JSON.stringify({
     multipackid
    
    }),
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-type": "text/plain",
    },
  });


  
 }

const handleEditButton=(input)=>{



}


  return (
    <div>
      <TopHeader
        setActiveHelp={setActiveHelp}
        setSettings={setSettings}
        setActiveHome={setActiveHome}
        activehome={activehome}
        activehelp={activehelp}
        setting={setting}
      ></TopHeader>

      <div>
        {isdata == true &&
          arr.map((value, index) => (
            <div className="product-list">
              <div className="product-list-div">
                <div className="product-list-img">
                  <img
                    className="product-img"
                    src={value.multipack_img}
                  />
                </div>
                <div className="product-list-dis">
                  <div className="title-text">{value.multipack_name}</div>
                  <div className="orderid-text">Price:{value.multipack_price}</div>
                  <div className="orderid-text">Quantity:{value.multipack_qty}</div>
                </div>
                <div className="product-list-button">
                  <div role="button" className="deletebutton" onClick={()=>{handleDeleteButton({value})}}>Delete</div>
                  <div role="button"className="deletebutton"  onClick={()=>{handleEditButton({value})}}>Edit</div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default SettingsPage;
