import { json } from "@remix-run/node";
import { useActionData, useNavigation, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  BlockStack,
  InlineStack,
  Form,
  FormLayout,
  TextField,
  Text,
  PageActions,
  Toast,
  Frame,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useState, useEffect } from "react";

// Move the function definition to the top
export const saveJsonData = async (formData, admin) => {
  try {
    const response = await admin.graphql(
      `#graphql
      mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          metafields: [
            {
              key: "settings",
              namespace: "global",
              ownerId: `${formData?.cartid}`,
              type: "json",
              value: `${formData.json}`,
            },
          ],
        },
      },
    );

    const responseJson = await response.json();



    return json({
      aftersave: responseJson,
    });
  } catch (error) {
    console.error("Error creating cart transform:", error);
    return json({
      error: "Error creating cart transform",
    });
  }
};

// Fix the function definition
export const action = async ({ request, params }) => {
  const shopifyCartTransformerId =
    process.env.SHOPIFY_CART_TRANSFORMER_ID || ""; // Replace with actual value
  const { admin } = await authenticate.admin(request);

  const data = { ...Object.fromEntries(await request.formData()) };

  if (data.action === "savejson")
  {
    const saveresponse = await saveJsonData(data, admin);
     await saveresponse.json();


  }

  try {
    const response = await admin.graphql(
      `#graphql
      mutation cartTransformCreate($functionId: String!) {
        cartTransformCreate(functionId: $functionId) {
          cartTransform {
            id
            functionId
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          blockOnFailure: true,
          functionId: shopifyCartTransformerId,
        },
      },
    );

    const responseJson = await response.json();

    if (responseJson?.data?.cartTransformCreate?.userErrors?.length > 0) {
      const existresponse = await get_existing_carttransform({ request });
      const existresponseJson = await existresponse.json();

      const { id, blockOnFailure, functionId, metafields } =
        (existresponseJson?.data?.cartTransforms?.nodes)[0];

      return json({
        cartTransform: { id, blockOnFailure, functionId, metafields },
      });
    }

    return json({
      cartTransform: responseJson,
    });
  } catch (error) {
    console.error("Error creating cart transform:", error);
    return json({
      error: "Error creating cart transform",
    });
  }
};

export const get_existing_carttransform = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);

    const response = await admin.graphql(
      `#graphql
      query fetchCartTransforms {
        cartTransforms(first: 1) {
          nodes {
            id
            blockOnFailure
            functionId
            metafields(first: 2) {
              nodes {
                id
                value
                namespace
              }
            }
          }
        }
      }`,
    );

    return response;
  } catch (error) {
    console.error("Error fetching existing cart transforms:", error);
    return null;
  }
};

export default function Index() {
  const nav = useNavigation();
  const submit = useSubmit();
  const actionData = useActionData();
  const [cartjson, setCartjson] = useState("");



  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";

  const generateProduct = () => submit({}, { replace: true, method: "POST" });

  useEffect(() => {
    setCartjson(actionData?.cartTransform?.metafields?.nodes[0]?.value);
  }, [actionData]);

  const active = 0;

  const toastMarkup = active ? <Toast content="Message sent" /> : null;

  return (
    <Frame>
      <Page>
        <BlockStack gap="500">
          <Layout>
            <Layout.Section>
              <Card>
                <BlockStack gap="500">
                  {!actionData?.cartTransform?.id ? (
                    <InlineStack gap="300">
                      <Button loading={isLoading} onClick={generateProduct}>
                        Install Cart Transform Function
                      </Button>
                    </InlineStack>
                  ) : (
                    <BlockStack gap="500">
                      <Text>
                        Function ID: {actionData?.cartTransform?.functionId}
                      </Text>
                      <Text>
                        Cart Transform ID: {actionData?.cartTransform?.id}
                      </Text>
                      <Form method="post">
                        <FormLayout>
                          <TextField
                            name="cartjson"
                            label="Function Setting (JSON)"
                            value={cartjson}
                            multiline={10}
                            onChange={setCartjson}
                          />
                          <PageActions
                            primaryAction={{
                              content: "Save",
                              onAction: () =>
                                submit(
                                  {
                                    action: "savejson",
                                    json: cartjson,
                                    cartid: actionData?.cartTransform?.id,
                                  },
                                  { method: "post" },
                                ),
                            }}
                          />
                        </FormLayout>
                      </Form>
                    </BlockStack>
                  )}
                </BlockStack>
              </Card>

              <Layout.Section></Layout.Section>
            </Layout.Section>
            <Layout.Section variant="oneThird"></Layout.Section>
          </Layout>
        </BlockStack>
        {toastMarkup}
      </Page>
    </Frame>
  );
}
