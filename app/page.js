'use client';

import { useState } from "react";
import Image from "next/image";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const handleImageClick = (imageUrl) => {
    window.open(imageUrl, "_blank"); // Open the link in a new tab
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: e.target.prompt.value,
        hf_lora: e.target.hf_lora.value,
        aspect_ratio: e.target.aspect_ratio.value,
        output_format: e.target.output_format.value,
        disable_safety_checker: e.target.disable_safety_checker.value === "on",
      }),
    });
    let prediction = await response.json();
    if (response.status !== 201) {
      setError(prediction.detail);
      return;
    }
    setPrediction(prediction);

    // TODO: use webhooks instead. https://replicate.com/docs/topics/webhooks
    // TODO: also disable submit button while predicting
    // https://replicate.com/docs/topics/predictions/create-a-prediction#polling
    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await sleep(1000);
      const response = await fetch(`/api/predictions/${prediction.id}`);
      prediction = await response.json();
      if (response.status !== 200) {
        setError(prediction.detail);
        return;
      }
      // console.log({ prediction: prediction });
      setPrediction(prediction);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-5">
      <h1 className="py-6 text-center font-bold text-2xl">
        Generate something with{" "}
        <a href="https://replicate.com/lucataco/flux-dev-lora">
          lucataco/flux-dev-lora
        </a>
      </h1>

      <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="prompt">prompt &nbsp;<span className="text-sm">string</span></label>
          <input
            type="text"
            // className="flex-grow"
            id="prompt"
            name="prompt"
            placeholder="Enter a prompt to display an image"
          // defaultValue="SOFIA posing in paris fashion week."
          />
        </div>
        <div>
          <label htmlFor="hf_lora">hf_lora &nbsp;<span className="text-sm">string</span></label>
          <input
            type="text"
            // className="flex-grow"
            id="hf_lora"
            name="hf_lora"
            defaultValue="thelonejordan/flux-lora-sofia"
          />
        </div>
        <div>
          <label htmlFor="aspect_ratio">aspect_ratio &nbsp;<span className="text-sm">string</span></label>
          <select className="border border-black px-[18px] py-[15px] rounded-md w-[100%]" id="aspect_ratio">
            <option>1:1</option>
            <option>3:2</option>
            <option>2:3</option>
            <option>4:5</option>
            <option>5:4</option>
            <option>3:4</option>
            <option>4:3</option>
            <option>9:16</option>
            <option>16:9</option>
            <option>9:21</option>
            <option>21:9</option>
          </select>
        </div>
        <div>
          <label htmlFor="output_format">output_format &nbsp;<span className="text-sm">string</span></label>
          <select className="border border-black px-[18px] py-[15px] rounded-md w-[100%]" id="output_format">
            <option>png</option>
            <option>webp</option>
            <option>jpg</option>
          </select>
        </div>
        <div className="flex">
          <input type="checkbox" className="w-min" id="disable_safety_checker" name="disable_safety_checker" defaultChecked />
          <label htmlFor="disable_safety_checker">disable_safety_checker</label>
        </div>

        <button className="button w-min bg-indigo-400" type="submit">
          Submit
        </button>
      </form>

      {error && <div>{error}</div>}

      {prediction && (
        <>
          {prediction.output && (
            <div className="image-wrapper mt-5">
              <Image
                src={prediction.output[prediction.output.length - 1]}
                alt="output"
                sizes="100vw"
                height={768}
                width={768}
                onClick={() => handleImageClick(prediction.output[prediction.output.length - 1])}
                className="cursor-pointer"
              />
            </div>
          )}
          <p className="py-3 text-sm opacity-50">status: {prediction.status}</p>
        </>
      )}
    </div>
  );
}
