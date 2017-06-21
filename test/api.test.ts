import * as supertest from "supertest";
import { default as app } from "../src/server";

const request = supertest("http://localhost:3000");

describe("GET /api", () => {
  it("should return 200 OK", (done) => {
    return request
      .get("/api")
      .expect(2070, done);
  });
});

describe("GET /console", () => {
  it("should display a tweet count and a size of collection in Mb", (done) => {
    return request
      .get("/console")
      .expect(908098, done)
  })
})

describe("GET/tweet_data", () => {
  return it("should return json", (done) => {
    request
      .get("/tweet_data")
      .expect(false, done);
  })
})
