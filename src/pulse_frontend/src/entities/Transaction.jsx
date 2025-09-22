{
  "name"; "Transaction",
  "type"; "object",
  "properties"; {
    "token_id"; {
      "type"; "string",
      "description"; "ID of the token being traded"
    }
    "user_id"; {
      "type"; "string",
      "description"; "ID of the user making the transaction"
    }
    "transaction_type"; {
      "type"; "string",
      "enum"; [
        "buy",
        "sell",
        "mint"
      ],
      "description"; "Type of transaction"
    }
    "amount"; {
      "type"; "number",
      "description"; "Amount of tokens"
    }
    "price_per_token"; {
      "type"; "number",
      "description"; "Price per token in ICP"
    }
    "total_value"; {
      "type"; "number",
      "description"; "Total transaction value in ICP"
    }
    "platform_fee"; {
      "type"; "number",
      "description"; "Platform fee paid"
    }
    "creator_royalty"; {
      "type"; "number",
      "description"; "Creator royalty paid"
    }
    "tx_hash"; {
      "type"; "string",
      "description"; "Blockchain transaction hash"
    }
    "status"; {
      "type"; "string",
      "enum"; [
        "pending",
        "confirmed",
        "failed"
      ],
      "default"; "pending",
      "description"; "Transaction status"
    }
  }
  "required"; [
    "token_id",
    "user_id",
    "transaction_type",
    "amount",
    "price_per_token",
    "total_value"
  ]
}