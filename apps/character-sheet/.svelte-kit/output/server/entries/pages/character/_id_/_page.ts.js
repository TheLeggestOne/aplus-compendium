import { m as mockPaladinAerindel } from "../../../../chunks/paladin-5.js";
import { error } from "@sveltejs/kit";
const MOCK_CHARACTERS = {
  aerindel: mockPaladinAerindel
};
const load = ({ params }) => {
  const character = MOCK_CHARACTERS[params["id"]];
  if (!character) {
    error(404, `Character "${params["id"]}" not found`);
  }
  return { character };
};
export {
  load
};
