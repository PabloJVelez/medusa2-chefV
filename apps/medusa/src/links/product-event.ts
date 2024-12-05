import { defineLink } from "@medusajs/framework/utils";
import EventModule from "../modules/event";
import ProductModule from "@medusajs/medusa/product";

export default defineLink(
  ProductModule.linkable.product,
  EventModule.linkable.event,
)