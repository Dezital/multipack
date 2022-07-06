import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  FormLayout,
  Frame,
  Heading,
  Icon,
  InlineError,
  Loading,
  Page,
  Select,
  TextField,
  EmptyState,
} from "@shopify/polaris";

import { getSessionToken } from "@shopify/app-bridge-utils";
import { useAppBridge } from "@shopify/app-bridge-react";
import LoadingSpinner from "./LoadingSpinner";
import FinalProductShow from "./FinalProductShow";

function PackCreationPage(productdata,{setLoadingd}) {
  console.log("this is loading",setLoadingd)
  const [orders, SetOrders] = useState();
  const [quantityofMultipack, setQuantityOfMultipacks] = useState();
  const [quantityofNewProduct, setQuantityofNewProduct] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [isShowProductData, setIShowProductData] = useState(false);

  const [multipackquantity,setMultipackQuantity] =useState();
  const [multipackName,setMultipackName]= useState()
  const [multipackprice,setMultipackPrice]=useState()
  const [multipackdiscription,setMultipackDiscription] =useState()
  const [multipackweight,setMultipackWeight]=useState()
  const [multipackSku,setMultipackSku]=useState()
  // const [multipackprice,setMultipackPrice]=useState();

  const app = useAppBridge();

  const handleFomSubmission = () => {
    let nw = productdata.productdata.variants[0].inventoryQuantity / quantityofMultipack;
    nw= Math.round(nw);
    setMultipackQuantity(nw)
    let multipacktitle = productdata.productdata.title + `-${quantityofMultipack}Packs`;
    setMultipackName(multipacktitle);
    let multipackpaisa = productdata.productdata.variants[0].price * nw;
    setMultipackPrice(`${multipackpaisa}`)
    let multipackdis = productdata.productdata.descriptionHtml;
    setMultipackDiscription(multipackdis);
    let multipackwgh = productdata.productdata.variants[0].weight * nw;
    setMultipackWeight(`${multipackwgh}`)
    let mulsku = productdata.productdata.variants[0].sku+`-${quantityofMultipack}Packs`
    setMultipackSku(`${mulsku}`)

    setIShowProductData(true)

    setIsLoading(true);

    
    //setIShowProductData(true);
    setIsLoading(false);
    // setIShowProductData(true);
    // input = input + 1;
  
    // createMultipack();
  };

  const handleForm2Submission = () => {
    createMultipack();
  };

  const handlechangeMultipackQuantity = (input) => {
    setQuantityOfMultipacks(input);
  };

  
  return (
    <div>
      <div className={`product-fullfillment-card `}>
        <div className="product-fullfillment-card-img">
          <div className="product-image-section">
            <img
              className="product-img"
              src={productdata.productdata.images[0].originalSrc}
            />
          </div>
        </div>

        <div className="product-fullfillment-card-details ">
          <div className="title-text">{productdata.productdata.title}</div>

          <div>
            <div className="orderid-text">
              SKU: {productdata.productdata.variants[0].sku}
            </div>
          </div>

          <div>
            <div className="orderid-text">
              Total Quantity:{" "}
              {productdata.productdata.variants[0].inventoryQuantity}
            </div>
          </div>
          <div>
            <div className="orderid-text">
              Product Price: {productdata.productdata.variants[0].price}
            </div>
          </div>
        </div>
      </div>
      <div className="Form-tags">
        <Form onSubmit={handleFomSubmission}>
          <FormLayout>
            <TextField
              value={quantityofMultipack}
              type="number"
              onChange={(input) => {
                handlechangeMultipackQuantity(input);
              }}
              label="Add Quantity of multipacks to be created"
              required
            />

            <div className="show-data"></div>
            <Button primary submit>
              Create MultiPack
            </Button>
          </FormLayout>
        </Form>
      </div>

      {isShowProductData ? (
      <FinalProductShow
      multipackName={multipackName}
      multipackprice={multipackprice}
      multipackdiscription={multipackdiscription}
      multipackweight={multipackweight}
      multipackSku={multipackSku}
      productdata={productdata}
      quantityofMultipack={quantityofMultipack}
      setLoadingd={setLoadingd}
      ></FinalProductShow>
      ) : (
        <div></div>
      )}
    </div>
  );
}

export default PackCreationPage;
