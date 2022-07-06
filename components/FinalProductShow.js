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

function FinalProductShow({
  multipackName,
  multipackprice,
  multipackdiscription,
  multipackweight,
  multipackSku,
  productdata,
  quantityofMultipack,
  setLoadingd,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const app = useAppBridge();

  //const [multipackSku,setMultipackSku]=useState()

  const handlesubmit = () => {
    createMultipack();
  };

  const createMultipack = async () => {
    setIsLoading(true);
    let multipackquantity = quantityofMultipack;
    let multipackimg = productdata.productdata.images[0].originalSrc.split(
      "?v="
    )[0];
    let OrignalProductId = productdata.productdata.id.replace(
      "gid://shopify/Product/",
      ""
    );
    let OriginalProductquantity =
      productdata.productdata.variants[0].inventoryQuantity;

    let multipackProductType = productdata.productdata.productType;

    let multipackBarcode = productdata.productdata.variants[0].barcode;

    let multipackweightUnit = productdata.productdata.variants[0].weightUnit;
      let product_name = productdata.productdata.variants[0].title;
      let product_varient_price = productdata.productdata.variants[0].price;
      let product_varient_weight = productdata.productdata.variants[0].weight;
      let OriginalProductSku =productdata.productdata.variants[0].sku;
    let OrginalProductVarientId = productdata.productdata.variants[0].id.replace(
      "gid://shopify/ProductVariant/",
      ""
    );

    console.log("i am good");
    const token = await getSessionToken(app);
    const res = await fetch("/createMultipack", {
      method: "POST",
      body: JSON.stringify({
        multipackName,
        multipackquantity,
        multipackprice,
        multipackimg,
        multipackdiscription,
        multipackSku,
        OrignalProductId,
        OriginalProductquantity,
        multipackProductType,
        multipackBarcode,
        multipackweight,
        OrginalProductVarientId,
        multipackweightUnit,
        product_name,
        product_varient_price,
        product_varient_weight,
        OriginalProductSku


      }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-type": "text/plain",
      },
    });

    setIsLoading(false);
   alert("Your Product created Successfully")
  };

  return (
    <div>
      {isLoading ? (
        <div>
          <LoadingSpinner></LoadingSpinner>
        </div>
      ) : (
        <div></div>
      )}
      <Card sectioned>
        <div className="New-Product-details">
          <div className="New-Product-Form-Section">
            <Form onSubmit={handlesubmit}>
              <FormLayout>
                {/* {error && (
              <InlineError message={errordata} fieldID="n"></InlineError>
            )} */}
                <TextField
                  value={multipackName}
                  onChange={() => {}}
                  label="Title"
                  type="text"
                  required
                />
                <TextField
                  value={multipackdiscription}
                  onChange={(handleChangeEmail) => {}}
                  label="Discription"
                  type="text"
                  multiline={4}
                  disabled="true"
                />
                <div className="form-small-layout">
                  <div className="Input-fieds-child">
                    <TextField
                      value={multipackSku}
                      onChange={() => {
                        "";
                      }}
                      label="SKU"
                      type="text"
                      disabled
                    />
                  </div>

                  <div className="Input-fieds-child">
                    <TextField
                      value={quantityofMultipack}
                      onChange={() => {
                        "";
                      }}
                      label="New Product Quantity"
                      type="number"
                      disabled
                    />
                  </div>

                  <div className="Input-fieds-child">
                    <TextField
                      value={multipackprice}
                      onChange={() => {
                        "";
                      }}
                      label="New Product Price"
                      type="number"
                      disabled
                    />
                  </div>
                  <div className="Input-fieds-child">
                    <TextField
                      value={multipackweight}
                      onChange={() => {
                        "";
                      }}
                      label="New Product Weight"
                      type="number"
                      disabled
                    />
                  </div>
                </div>

                <Button primary submit>
                  Submit
                </Button>
              </FormLayout>
            </Form>
          </div>
          <div className="New-Product-image-section">
            <h3>Product Image</h3>
            <div className="Img-border">
              <img
                className="new-product-img"
                src={productdata.productdata.images[0].originalSrc}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default FinalProductShow;
