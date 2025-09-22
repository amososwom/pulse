{
  "name"; "Token",
  "type"; "object",
  "properties"; {
    "name"; {
      "type"; "string",
      "description"; "Name of the creator token"
    }
    "symbol"; {
      "type"; "string",
      "description"; "Token symbol (e.g., PULSE, CLOUT)"
    }
    "description"; {
      "type"; "string",
      "description"; "Token description and utility"
    }
    "creator_id"; {
      "type"; "string",
      "description"; "ID of the token creator"
    }
    "creator_name"; {
      "type"; "string",
      "description"; "Name of the creator"
    }
    "creator_avatar"; {
      "type"; "string",
      "description"; "Creator profile image URL"
    }
    "total_supply"; {
      "type"; "number",
      "description"; "Total token supply"
    }
    "current_price"; {
      "type"; "number",
      "description"; "Current price in ICP"
    }
    "market_cap"; {
      "type"; "number",
      "description"; "Market capitalization"
    }
    "volume_24h"; {
      "type"; "number",
      "description"; "24h trading volume"
    }
    "price_change_24h"; {
      "type"; "number",
      "description"; "24h price change percentage"
    }
    "holders_count"; {
      "type"; "number",
      "description"; "Number of token holders"
    }
    "curve_type"; {
      "type"; "string",
      "enum"; [
        "linear",
        "bonding",
        "fixed"
      ],
      "description"; "Token pricing curve type"
    }
    "category"; {
      "type"; "string",
      "enum"; [
        "gaming",
        "art",
        "music",
        "sports",
        "lifestyle",
        "tech",
        "other"
      ],
      "description"; "Creator category"
    }
    "is_active"; {
      "type"; "boolean",
      "default"; true,
      "description"; "Whether token is actively trading"
    }
    "royalty_percentage"; {
      "type"; "number",
      "description"; "Creator royalty on trades"
    }
    "platform_fee"; {
      "type"; "number",
      "default"; 2.5,
      "description"; "Platform fee percentage"
    }
  }
  "required"; [
    "name",
    "symbol",
    "creator_id",
    "creator_name",
    "total_supply",
    "current_price"
  ]
}
