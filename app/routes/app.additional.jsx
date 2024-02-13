import {
  Box,
  Card,
  Layout,
  Link,
  Button,
  Page,
  Text,
  BlockStack,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export default function AdditionalPage() {

  async function installCart(e) {
    console.log('Test');
    var myHeaders = new Headers();
    myHeaders.append("X-Shopify-Access-Token", "shpua_da292fe9eccebb80c1772a563d343436");
    myHeaders.append("mode", 'cors');
    myHeaders.append("Access-Control-Allow-Origin", "*");
    myHeaders.append("Content-Type", "application/graphql");

    var graphql = JSON.stringify({
      query: "mutation cartTransformCreate {\n  cartTransformCreate(\n    functionId: \"42585540-7876-424c-8ceb-76ef1e7483aa\",\n    blockOnFailure: false\n  ) {\n    cartTransform {\n      id\n      functionId\n    }\n    userErrors {\n      field\n      message\n    }\n  }\n}",
      variables: {}
    })
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: graphql,
      redirect: 'follow'
    };

    fetch("https://extensiontestingstore.myshopify.com/admin/api/2024-01/graphql.json", requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));

  }

  return (
    <Page>
      <ui-title-bar title="Cart Transform" />
      <Layout>
        <Layout.Section >
          <Card>
            <BlockStack gap="300">
              <Text as="p" variant="bodyMd">
                Function ID{" "}
              </Text>
            </BlockStack>

            <BlockStack gap="300">
              <Button onClick={installCart}>Install Cart Tranform</Button>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

