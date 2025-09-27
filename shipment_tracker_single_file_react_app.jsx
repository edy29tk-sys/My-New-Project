import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "./firebase";
import { collection, addDoc, doc, getDoc, setDoc } from "firebase/firestore";
import emailjs from "emailjs-com";

export default function App() {
  const [trackingId, setTrackingId] = useState("");
  const [shipments, setShipments] = useState(null);
  const [customerEmail, setCustomerEmail] = useState("");
  const [statusInput, setStatusInput] = useState("");
  const [trackingInput, setTrackingInput] = useState("");

  // Generate unique tracking ID
  const generateTrackingId = () => {
    return "TRK" + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  // Create shipment
  const createShipment = async (e) => {
    e.preventDefault();
    const id = generateTrackingId();
    const shipment = {
      trackingId: id,
      status: ["Shipment Created"],
      createdAt: new Date(),
      email: customerEmail,
    };
    await setDoc(doc(db, "shipments", id), shipment);
    setTrackingId(id);
    setShipments(shipment);
    sendEmail(shipment);
  };

  // Send email using EmailJS
  const sendEmail = (shipment) => {
    const templateParams = {
      to_email: shipment.email,
      tracking_id: shipment.trackingId,
      tracking_link: window.location.origin + "?track=" + shipment.trackingId,
      company_name: "SwiftShip Logistics",
      logo_url: "https://via.placeholder.com/150x50?text=SwiftShip+Logo",
    };

    emailjs
      .send(
        "your_service_id", // replace with your EmailJS service ID
        "your_template_id", // replace with your EmailJS template ID
        templateParams,
        "IDMfw7HeyBIc_EBtf" // public key only
      )
      .then(
        (result) => {
          console.log("Email sent successfully:", result.text);
        },
        (error) => {
          console.error("Email sending failed:", error);
        }
      );
  };

  // Track shipment
  const trackShipment = async (e) => {
    e.preventDefault();
    const ref = doc(db, "shipments", trackingInput);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setShipments(snap.data());
      setTrackingId(trackingInput);
    } else {
      setShipments(null);
      setTrackingId("");
      alert("Tracking ID not found");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      {/* Logo */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <img
          src="https://via.placeholder.com/150x50?text=SwiftShip+Logo"
          alt="Logo"
          className="mb-6"
        />
      </motion.div>

      <h1 className="text-3xl font-bold mb-4 text-gray-800">
        SwiftShip Shipment Tracker
      </h1>

      {/* Create Shipment */}
      <Card className="w-full max-w-md mb-6">
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">Create Shipment</h2>
          <form onSubmit={createShipment} className="space-y-3">
            <Input
              placeholder="Customer Email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">
              Generate Tracking ID & Send Email
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Track Shipment */}
      <Card className="w-full max-w-md mb-6">
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">Track Shipment</h2>
          <form onSubmit={trackShipment} className="space-y-3">
            <Input
              placeholder="Enter Tracking ID"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
            />
            <Button type="submit" className="w-full">
              Track
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Shipment Status */}
      {shipments && (
        <Card className="w-full max-w-md">
          <CardContent>
            <h2 className="text-xl font-semibold mb-2">Shipment Status</h2>
            <p className="text-sm text-gray-600 mb-2">
              Tracking ID: {shipments.trackingId}
            </p>
            <ul className="space-y-1">
              {shipments.status.map((s, i) => (
                <li key={i} className="text-gray-800">
                  • {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
