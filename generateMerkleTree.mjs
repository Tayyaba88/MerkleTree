import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, get, child } from "firebase/database";
import fs from "fs";
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};
const app = initializeApp(firebaseConfig);

const database = getDatabase();
const addressesRef = ref(database, "ethereumAddresses");
const values = [["0xF560b76B5081eee5F54772e9D"]];
const fetchedAddresses = [];
let snapshot;
const fetchAddresses = async () => {
  try {
    snapshot = await get(child(addressesRef, "/"));
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        fetchedAddresses.push(childSnapshot.val());
      });
      console.log("Fetched addresses:", fetchedAddresses);
    } else {
      console.log("No data available");
    }
  } catch (error) {
    console.error("Error fetching addresses:", error);
  }
};
const pushAddresses = async () => {
  for (const address of values) {
    if (!fetchedAddresses.includes(address[0])) {
      console.log(address);
      try {
        await push(addressesRef, address[0]);
        console.log("Address pushed:", address[0]);
      } catch (error) {
        console.error("Error pushing address:", error);
      }
    }
  }
};
await fetchAddresses()
  .then(async () => {
    // After fetching addresses, push new ones
    await pushAddresses();
    // Write fetched addresses to a file
    fs.writeFile(
      "fetched_addresses.txt",
      fetchedAddresses.join("\n"),
      (err) => {
        if (err) {
          console.error("Error writing to file:", err);
          return;
        }
        console.log("Fetched addresses written to file successfully.");
      }
    );
  })
  .catch((error) => {
    console.error("Error fetching addresses:", error);
  });
const formattedAddresses = fetchedAddresses.map((address) => [address]);
console.log(":rocket: ~ formattedAddresses:", formattedAddresses);
const tree = StandardMerkleTree.of(formattedAddresses, ["address"]);
console.log("Merkle Root:", tree.root);
const proof = tree.getProof(["0x8ccdb42f781e746483ge7448574hf"]);

console.log("Proof for", "targetAddress" + ":", proof);
