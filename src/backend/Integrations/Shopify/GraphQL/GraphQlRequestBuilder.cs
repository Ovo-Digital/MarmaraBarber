using System.Text;
using System.Text.Json;

namespace HeadlessCommerce.Integrations.Shopify.GraphQL;

public sealed class GraphQlRequest
{
    public string Query { get; init; } = string.Empty;
    public object? Variables { get; init; }
}

public sealed class GraphQlRequestBuilder
{
    private readonly StringBuilder _query = new();
    private readonly Dictionary<string, object?> _variables = new();
    private int _varCounter;

    public GraphQlRequestBuilder Operation(string name, string type = "query")
    {
        _query.AppendLine($"{type} {name} {{");
        return this;
    }

    public GraphQlRequestBuilder Field(string name, Action<GraphQlRequestBuilder>? nested = null)
    {
        _query.Append(name);
        if (nested is not null)
        {
            _query.Append(" { ");
            nested(this);
            _query.Append(" }");
        }
        _query.AppendLine();
        return this;
    }

    public GraphQlRequestBuilder WithVariable<T>(string name, T value, string graphqlType)
    {
        var varName = name.TrimStart('$');
        _variables[varName] = value;
        return this;
    }

    public GraphQlRequestBuilder Close()
    {
        _query.AppendLine("}");
        return this;
    }

    public GraphQlRequest Build() => new()
    {
        Query = _query.ToString(),
        Variables = _variables.Count > 0 ? _variables : null
    };

    public string AddVariable(object value)
    {
        var key = $"var{_varCounter++}";
        _variables[key] = value;
        return key;
    }
}

public static class GraphQlSerializer
{
    private static readonly JsonSerializerOptions Options = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public static StringContent ToJsonContent(GraphQlRequest request)
        => new(JsonSerializer.Serialize(request, Options), Encoding.UTF8, "application/json");
}

public static class StorefrontQueries
{
    public const string GetProducts = """
        query GetProducts($first: Int!, $after: String) {
          products(first: $first, after: $after) {
            edges {
              cursor
              node {
                id
                handle
                title
                description
                availableForSale
                featuredImage { url }
                priceRange {
                  minVariantPrice { amount currencyCode }
                }
                variants(first: 10) {
                  edges {
                    node {
                      id
                      title
                      availableForSale
                      sku
                      price { amount currencyCode }
                    }
                  }
                }
              }
            }
          }
        }
        """;

    public const string GetProductByHandle = """
        query GetProduct($handle: String!) {
          product(handle: $handle) {
            id
            handle
            title
            description
            availableForSale
            featuredImage { url }
            priceRange {
              minVariantPrice { amount currencyCode }
            }
            variants(first: 25) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  sku
                  price { amount currencyCode }
                }
              }
            }
          }
        }
        """;

    public const string GetCollections = """
        query GetCollections($first: Int!) {
          collections(first: $first) {
            edges {
              node {
                id
                handle
                title
                image { url }
              }
            }
          }
        }
        """;

    public const string SearchProducts = """
        query SearchProducts($query: String!, $first: Int!) {
          search(query: $query, first: $first, types: PRODUCT) {
            edges {
              node {
                ... on Product {
                  id
                  handle
                  title
                  description
                  availableForSale
                  featuredImage { url }
                  priceRange {
                    minVariantPrice { amount currencyCode }
                  }
                }
              }
            }
          }
        }
        """;

    public const string CreateCart = """
        mutation CartCreate {
          cartCreate {
            cart {
              id
              checkoutUrl
              totalQuantity
              cost {
                totalAmount { amount currencyCode }
              }
              lines(first: 50) {
                edges {
                  node {
                    id
                    quantity
                    merchandise {
                      ... on ProductVariant {
                        id
                        title
                        price { amount currencyCode }
                        product { title }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        """;

    public const string CartLinesAdd = """
        mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
          cartLinesAdd(cartId: $cartId, lines: $lines) {
            cart {
              id
              checkoutUrl
              cost { totalAmount { amount currencyCode } }
              lines(first: 50) {
                edges {
                  node {
                    id
                    quantity
                    merchandise {
                      ... on ProductVariant {
                        id
                        title
                        price { amount currencyCode }
                        product { title }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        """;

    public const string CartLinesRemove = """
        mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
          cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
            cart {
              id
              checkoutUrl
              cost { totalAmount { amount currencyCode } }
              lines(first: 50) {
                edges {
                  node {
                    id
                    quantity
                    merchandise {
                      ... on ProductVariant {
                        id
                        title
                        price { amount currencyCode }
                        product { title }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        """;

    public const string GetCart = """
        query GetCart($cartId: ID!) {
          cart(id: $cartId) {
            id
            checkoutUrl
            cost { totalAmount { amount currencyCode } }
            lines(first: 50) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price { amount currencyCode }
                      product { title }
                    }
                  }
                }
              }
            }
          }
        }
        """;
}

public static class AdminQueries
{
    public const string GetOrders = """
        query GetOrders($first: Int!, $after: String) {
          orders(first: $first, after: $after, sortKey: CREATED_AT, reverse: true) {
            edges {
              node {
                id
                name
                email
                totalPriceSet { shopMoney { amount currencyCode } }
                displayFinancialStatus
                createdAt
              }
            }
          }
        }
        """;

    public const string GetCustomers = """
        query GetCustomers($first: Int!, $after: String) {
          customers(first: $first, after: $after) {
            edges {
              node {
                id
                email
                firstName
                lastName
              }
            }
          }
        }
        """;

    public const string GetProducts = """
        query GetAdminProducts($first: Int!, $after: String) {
          products(first: $first, after: $after) {
            edges {
              node {
                id
                handle
                title
                description
                status
                featuredMedia { preview { image { url } } }
                variants(first: 1) {
                  edges {
                    node {
                      id
                      price
                      sku
                      inventoryQuantity
                    }
                  }
                }
              }
            }
          }
        }
        """;

    public const string CreateMetafield = """
        mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafields) {
            metafields { id namespace key value }
            userErrors { field message }
          }
        }
        """;

    public const string UpdateInventory = """
        mutation InventorySet($input: InventorySetQuantitiesInput!) {
          inventorySetQuantities(input: $input) {
            inventoryAdjustmentGroup { createdAt }
            userErrors { field message }
          }
        }
        """;
}
