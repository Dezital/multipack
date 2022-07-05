import "@babel/polyfill";
import dotenv from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import Shopify, { ApiVersion, DataType } from "@shopify/shopify-api";

import Koa from "koa";
import next from "next";
import Router from "koa-router";
import Shop from "./models/shopsettings";

import {
  createClient,
  getSubscriptionUrl,
  getAppSubscriptionStatus,
} from "./handlers";

import helmet from "koa-helmet";

const mongoose = require("mongoose");
const koaBody = require("koa-body");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const mysql2 = require("mysql2");

let ctxglobal;
const crypto = require("crypto");
let newhost;

const pool_multipack = mysql2.createPool({
  host: "localhost",
  user: "shan",
  password: "",
  database: "multipack_creator",
});
const con = mysql2.createConnection({
  host: "localhost",
  user: "shan",
  password: "",
  database: "multipack_creator",
});

dotenv.config();
const port = parseInt(process.env.PORT, 10) || 8081;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
});
const handle = app.getRequestHandler();

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES.split(","),
  HOST_NAME: process.env.HOST.replace(/https:\/\/|\/$/g, ""),
  API_VERSION: ApiVersion.October20,
  IS_EMBEDDED_APP: true,
  // This should be replaced with your preferred storage strategy
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

// Storing the currently active shops in memory will force them to re-login when your server restarts. You should
// persist this object in your app.
const ACTIVE_SHOPIFY_SHOPS = {};

app.prepare().then(async () => {
  const server = new Koa();
  const router = new Router();

  const setContentSecurityHeader = (ctx, next) => {
    // Cookie is set after auth
    if (ctx.cookies.get("shopOrigin")) {
      return helmet.contentSecurityPolicy({
        directives: {
          defaultSrc: helmet.contentSecurityPolicy.dangerouslyDisableDefaultSrc,
          frameAncestors: [
            `https://${ctx.cookies.get("shopOrigin")}`,
            "https://admin.shopify.com",
          ],
        },
      })(ctx, next);
    } else {
      // Before auth => no cookie set...
      return helmet.contentSecurityPolicy({
        directives: {
          defaultSrc: helmet.contentSecurityPolicy.dangerouslyDisableDefaultSrc,
          frameAncestors: [
            `https://${ctx.query.shop}`,
            "https://admin.shopify.com",
          ],
        },
      })(ctx, next);
    }
  };
  server.use(setContentSecurityHeader);
  server.keys = [Shopify.Context.API_SECRET_KEY];
  server.use(
    createShopifyAuth({
      accessMode: "offline",
      prefix: "/install",
      async afterAuth(ctx) {
        // Access token and shop available in ctx.state.shopify
        const { shop, accessToken, scope } = ctx.state.shopify;
        const host = ctx.query.host;
        newhost = host;
        console.log("here we have offline acces token", accessToken);

        // set shopOrigin cookie, so it can be used for click jacking header
        ctx.cookies.set("shopOrigin", shop, {
          httpOnly: false,
          secure: true,
          sameSite: "none",
        });
        ACTIVE_SHOPIFY_SHOPS[shop] = scope;

        /* added this section for Billing API implementation */
        // const response = await Shopify.Webhooks.Registry.register({

        //   shop,
        //   accessToken,
        //   path: "/webhooks",
        //   topic: "APP_UNINSTALLED",
        //   webhookHandler: async (topic, shop, body) => {
        //     console.log("WEBHOOK");
        //     delete ACTIVE_SHOPIFY_SHOPS[shop];
        //   },
        // });
        // if (response.success) {
        //   console.log("response is here ", response);
        // }
        // if (!response.success) {
        //   console.log(
        //     `Failed to register APP_UNINSTALLED webhook: ${response.result}`
        //   );
        // }

        // Redirect to app with shop parameter upon auth
        ctx.redirect(`/?shop=${shop}&host=${host}`);
        // console.log(ctx);
        // await getSubscriptionUrl(ctx);
      },
    })
  );
  server.use(
    
    createShopifyAuth({
      accessMode: "offline",
      async afterAuth(ctx) {
        // Access token and shop available in ctx.state.shopify
        const { shop, accessToken, scope } = ctx.state.shopify;
        const host = ctx.query.host;
        newhost = host;

        // set shopOrigin cookie, so it can be used for click jacking header
        ctx.cookies.set("shopOrigin", shop, {
          httpOnly: false,
          secure: true,
          sameSite: "none",
        });
        ACTIVE_SHOPIFY_SHOPS[shop] = scope;

        /* added this section for Billing API implementation */
        const response = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: "/webhooks",
          topic: "APP_UNINSTALLED",
          webhookHandler: async (topic, shop, body) => {
            // console.log("WEBHOOK");
            delete ACTIVE_SHOPIFY_SHOPS[shop];
          },
        });
        if (response.success) {
          // console.log("response is here ", response);
        }
        if (!response.success) {
          // console.log(
          //   `Failed to register APP_UNINSTALLED webhook: ${response.result}`
          // );
        }
        console.log("we are in online one");

        // Redirect to app with shop parameter upon auth
        ctx.redirect(`/install/auth?shop=${shop}&host=${host}`);
        
        // console.log(ctx);
        // await getSubscriptionUrl(ctx);
      },
    })
  );

  // Moongoos connection

  const handleRequest = async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  };

  router.post("/createMultipack", async (ctx) => {
   
    const session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res);
    const shop = session.shop;
    const multipackname = JSON.parse(ctx.request.body).multipackName;
    const multipackquantity = JSON.parse(ctx.request.body).multipackquantity;
    const multipackprice = JSON.parse(ctx.request.body).multipackprice;
    const multipackdiscription = JSON.parse(ctx.request.body)
      .multipackdiscription;
    const multipackimg = JSON.parse(ctx.request.body).multipackimg;
    const multipackSKU = JSON.parse(ctx.request.body).multipackSku;
    const multipackProductType = JSON.parse(ctx.request.body)
      .multipackProductType;

    const multipackbarcode = JSON.parse(ctx.request.body).multipackBarcode;
    const multipackWeight = JSON.parse(ctx.request.body).multipackweight;
    const multipackweightUnit = JSON.parse(ctx.request.body)
      .multipackweightUnit;
    const OriginalProductquantity = JSON.parse(ctx.request.body)
      .OriginalProductquantity;
    const OrignalProductId = JSON.parse(ctx.request.body).OrignalProductId;
    const OrginalProductVarientId = JSON.parse(ctx.request.body)
      .OrginalProductVarientId;

    let Newmultipackid;
    let NewProductVarientId;
    let NewProductVarinetInventoryId;
    let StoreLocaction;
    let client;

    try {
      client = new Shopify.Clients.Rest(session.shop, session.accessToken);
      await client
        .post({
          path: `products`,
          data: {
            product: {
              title: multipackname,
              body_html: multipackdiscription,
              product_type: multipackProductType,
            },
          },
          type: DataType.JSON,
        })
        .then(async ({ body }) => {
          console.log("products", body);
          let newvariable = body.product;
          Newmultipackid = newvariable.id;
          NewProductVarientId = newvariable.variants[0].id;
          NewProductVarinetInventoryId =
            newvariable.variants[0].inventory_item_id;

          await client
            .put({
              path: `variants/${NewProductVarientId}`,
              data: {
                variant: {
                  id: NewProductVarientId,
                  price: multipackprice,
                  fulfillment_service: "manual",
                  inventory_management: "shopify",
                  sku: `${multipackWeight}`,
                  weight: `${multipackWeight}`,
                },
              },
              type: DataType.JSON,
            })
            .then(async ({ body }) => {
              await client
                .post({
                  path: `products/${Newmultipackid}/images`,
                  data: {
                    image: { src: `${multipackimg}` },
                  },
                  type: DataType.JSON,
                })
                .then(({ body }) => {
                  console.log("in image creation", body);
                })
                .catch((err) =>
                  console.log("error in product create image", err)
                );

              await client
                .get({
                  path: "locations",
                })
                .then(async ({ body }) => {
                  console.log("response body", body.locations[0].id);
                  var locationid = body.locations[0].id;
                  StoreLocaction = locationid;
                  console.log("locationid", locationid);
                  await client
                    .post({
                      path: `inventory_levels/set`,
                      data: {
                        location_id: StoreLocaction,
                        inventory_item_id: NewProductVarinetInventoryId,
                        available: multipackquantity,
                      },
                      type: DataType.JSON,
                    })
                    .then(({ body }) => {
                      console.log("this is price", body);
                      console.log({ body });

                      ctx.status = 100;
                    })
                    .catch((err) => {
                      console.log("Error in updateing privce", err);
                      ctx.body = {
                        status: "False",
                      };
                      ctx.status = 400;
                    });
                })
                .catch((err) => console.log(err));

              console.log("in varient", body);
            })
            .catch((err) => console.log("error in the thing", err));
          ctx.body = {
            status: "OK",
          };
          ctx.status = 200;
        })
        .catch((err) => {
          console.log("Error in products", err);
          ctx.body = {
            status: "False",
          };
          ctx.status = 200;
        });
    } catch (error) {
      console.log("errro in fullfilment");
    }

    pool_multipack.getConnection((err, connection) => {
      if (err) throw err;
      // console.log(`connected as id ${connection.threadId}`);
      let stmt = `INSERT INTO multipack(
        multipack_name,
        multipack_id,
        multipack_price,
        multipack_img,
        multipack_qty,
        multipack_varient_id,
        multipack_varient_sku,
        multipack_varient_barcode,
        multipack_varient_weight,
        product_id,
        product_varient_id,
        product_varient_quantity,
        product_varient_sku,
        created_at,
        updated_at
        )
       VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
      let todo = [
        multipackname,
        Newmultipackid,
        multipackprice,
        multipackimg,
        multipackquantity,
        NewProductVarientId,
        multipackSKU,
        multipackbarcode,
        multipackWeight,
        OrignalProductId,
        multipackbarcode,
        OriginalProductquantity,
        multipackSKU,
        "toady",
        "yesterday",
      ];

      // execute the insert statment
      connection.query(stmt, todo, (err, results, fields) => {
        if (!err) {
          console.log("results in uploading product", results);
        } else {
          console.log("error in submitting orders", err);
        }

        // console.log(item.name);

        connection.release(); // return the connection to pool
      });

      //insert into shipping
    });
  });

  router.get("/getProrductsList", async (ctx) => {
    var data;

    await con
      .promise()
      .query("SELECT * FROM multipack")
      .then(([rows, fields]) => {
        console.log(rows);
        data = rows;
        // return rows;
      })
      .catch(console.log("eee"));

    console.log("eddd", data);
    ctx.body = {
      status: "OK",
      data: data,
    };

    ctx.status = 200;
  });

  router.post("/deleteProduct", async (ctx) => {
    const session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res);
    const shop = session.shop;
    const multipackid = JSON.parse(ctx.request.body).multipackid;
    try {
      const client = new Shopify.Clients.Rest(
        session.shop,
        session.accessToken
      );

      await client
        .delete({
          path: `products/${multipackid}`,
        })
        .then(({ body }) => {
          ctx.body = {
            status: "OK",
          };
          ctx.status = 200;

          pool_multipack.getConnection((err, connection) => {
            if (err) throw err;
            // console.log(`connected as id ${connection.threadId}`);
            let stmt = `DELETE * FROM multipack where multipack_id=${multipackid}`;

            // execute the insert statment
            connection.query(stmt, todo, (err, results, fields) => {
              if (!err) {
                console.log("results in delete", results);
              } else {
                console.log("error in submitting orders", err);
              }

              // console.log(item.name);

              connection.release(); // return the connection to pool
            });

            //insert into shipping
          });
        })
        .catch((err) => console.log(err));
    } catch (err) {
      console.log("Err in cath", err);
    }
  });
  router.post("/updatePartialTags", async (ctx) => {
    const session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res);
    const shop = session.shop;
    const tagsupdate = JSON.parse(ctx.request.body).tagsupdate;

    try {
      await Shop.updateOne(
        { shopName: shop },
        {
          ParticalTags: tagsupdate,
        },
        { upsert: true }
      )
        .then((result) => {
          console.log("updated tags", result);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {}
  });
  //toupdate carrier of the store
  router.post("/updateCarrier", async (ctx) => {
    // const session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res);
    // const shop = session.shop;
    // const carriers = JSON.parse(ctx.request.body).carrier;
    console.log("carriers");

    try {
      await Shop.updateOne(
        { shopName: shop },
        {
          carrier: carriers,
        },
        { upsert: true }
      )
        .then((result) => {
          console.log("updated carriers", result);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {}
  });

  router.get("/getMyShopSettings", async (ctx) => {
    const session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res);
    const shop = session.shop;
    try {
      await Shop.findOne({ shopName: shop })
        .then((result) => {
          // console.log("found", result);
          var response = result;
          ctx.body = {
            status: "OK",
            data: response,
          };
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {}
    ctx.status = 200;
  });

  // To Fetch Products from store
  router.get("/products", async (ctx) => {
    const session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res);
    const shop = session.shop;
  
    let productList = [];
    try {
      const client = new Shopify.Clients.Rest(
        session.shop,
        session.accessToken
      );

      await client
        .get({
          path: `products`,
        })
        .then(({ body }) => {
          productList = body.products;
        })
        .catch((err) => console.log(err));
    } catch (err) {
      console.log("Err in cath", err);
    }
    ctx.body = {
      status: "OK",
      data: productList,
    };
    ctx.status = 200;
  });
  // To Fetch all orders from store
  router.get("/orders", async (ctx) => {
    const session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res);
    const client = createClient(session.shop, session.accessToken);

    let ordersList = [];
    try {
      const clients = new Shopify.Clients.Rest(
        session.shop,
        session.accessToken
      );
      await clients
        .get({
          path: `orders`,
          query: { status: "any" },
        })
        .then(({ body }) => {
          ordersList = body.orders;
        })
        .catch((err) => console.log(err));
      // console.log("Logging orders", ordersList);
    } catch (err) {
      console.log("Err in cath", err);
    }
    ctx.body = {
      status: "OK",
      data: ordersList,
    };
    ctx.status = 200;
  });

  // searching order by order number
  router.post("/ordersNumber", async (ctx) => {
    const session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res);
    let ordernumberrecived = JSON.parse(ctx.request.body).ordernumber;
    if (ordernumberrecived.includes("#")) {
      ordernumberrecived.replace("#", "");
    }
    const order_number = JSON.parse(ctx.request.body).ordernumber;
    let ordersList = [];

    try {
      const client = new Shopify.Clients.Rest(
        session.shop,
        session.accessToken
      );
      await client
        .get({
          path: `orders`,
          query: { name: order_number },
        })
        .then(({ body }) => {
          console.log(body);
          ordersList = body.orders;
        })
        .catch((err) => console.log(err));
    } catch (err) {
      console.log("Err in cath", err);
    }
    if (ordersList.length > 0) {
      var orderid = ordersList[0].id;
      let ordersDetails = [];

      try {
        const client = new Shopify.Clients.Rest(
          session.shop,
          session.accessToken
        );
        await client
          .get({
            path: `orders/${orderid}`,
          })
          .then(({ body }) => {
            console.log("product detatis for an order");
            ordersDetails = body.order;
          })
          .catch((err) => console.log(err));
      } catch (err) {
        console.log("Err in cath", err);
      }
      ctx.body = {
        status: "OK",
        data: ordersDetails,
      };
      ctx.status = 200;
    } else {
      ctx.body = {
        status: "NOTFOUND",
      };
      ctx.status = 200;
    }
  });

  // To fetch single order details
  router.get("/ordersdetails", async (ctx) => {
    let id = ctx.request.url;
    let productid = id.replace("/ordersdetails?id=", "");
    let ordersList = [];
    const session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res);

    try {
      const client = new Shopify.Clients.Rest(
        session.shop,
        session.accessToken
      );
      await client
        .get({
          path: `orders/${productid}`,
        })
        .then(({ body }) => {
          ordersList = body.order;
        })
        .catch((err) => console.log(err));
    } catch (err) {
      console.log("Err in cath", err);
    }
    ctx.body = {
      status: "OK",
      data: ordersList,
    };
    ctx.status = 200;
  });

  cron.schedule("1 * * * * *", function () {
    console.log("running a task");
    const shop = "scanandfulfill.myshopify.com";
    const session = await Shopify.Utils.loadOfflineSession();

  });

  // For Adding settings

  router.post("/webhooks", async (ctx) => {
    const shop = ctx.request.header["x-shopify-shop-domain"];
    console.log(shop);
    delete ACTIVE_SHOPIFY_SHOPS[shop];
    // console.log("deleted");
    try {
      await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
      // console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      // console.log(`Failed to process webhook: ${error}`);
    }
  });

  function verifyWebhookRequest(body, req) {
    try {
      const generatedHash = crypto
        .createHmac("SHA256", Shopify.Context.API_SECRET_KEY)
        .update(JSON.stringify(body), "utf8")
        .digest("base64");
      const ShopifyHeader = "x-shopify-hmac-sha256";
      console.log("generated hash", generatedHash);

      const hmac = req.get(ShopifyHeader);
      console.log("hmac");
      const safeCompareResult = Shopify.Utils.safeCompare(generatedHash, hmac);
      console.log("comparision results", safeCompareResult);
      if (safeCompareResult) {
        console.log("Safe");
        return true;
      } else {
        console.log("Not Safe");
        return false;
      }
    } catch (error) {
      console.log("error", error);
      return false;
    }
  }

  router.post("/data_request", (ctx) => {
    if (verifyWebhookRequest(ctx.request.body, ctx.request) === true) {
      console.log("verified :)");
      ctx.res.statusCode = 200;
      // do something with the ctx.request.body
    } else {
      console.log("Not verified");
      ctx.res.statusCode = 401;
    }
    // ctx.res.statusCode = 200;
    // console.log('ctx is ',ctx)
    // console.log(ctx.res)

    // console.log("data request for that")
    // try {
    //   await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
    //   console.log(`Webhook processed, returned status code 200`);
    // } catch (error) {
    //   console.log(`Failed to process webhook: ${error}`);
    // }
  });
  router.post("/shop/redact", (ctx) => {
    if (verifyWebhookRequest(ctx.request.body, ctx.request) === true) {
      console.log("verified :)");
      ctx.res.statusCode = 200;
      // do something with the ctx.request.body
    } else {
      console.log("Not verified");
      ctx.res.statusCode = 401;
    }
  });
  router.post("/customers/redact", (ctx) => {
    if (verifyWebhookRequest(ctx.request.body, ctx.request) === true) {
      console.log("verified :)");
      ctx.res.statusCode = 200;
      // do something with the ctx.request.body
    } else {
      console.log("Not verified");
      ctx.res.statusCode = 401;
    }
  });

  router.post(
    "/graphql",
    verifyRequest({ returnHeader: true }),
    async (ctx, next) => {
      await Shopify.Utils.graphqlProxy(ctx.req, ctx.res);
    }
  );

  router.get("(/_next/static/.*)", handleRequest); // Static content is clear
  router.get("/_next/webpack-hmr", handleRequest); // Webpack content is clear
  router.get("(.*)", async (ctx) => {
    const shop = ctx.query.shop;

    // This shop hasn't been seen yet, go through OAuth to create a session
    if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
      ctx.redirect(`/auth?shop=${shop}`);
      ctx.response.statusCode = 401;
    } else {
      await handleRequest(ctx);
    }
  });

  server.use(router.allowedMethods());
  server.use(koaBody());
  server.use(router.routes());
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
