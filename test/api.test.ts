import * as supertest from "supertest";
import { default as app } from "../src/server";

//const request = supertest("http://localhost:3000");
const request = supertest(app);

describe("GET /api", () => {
  it("should return 200 OK", () => {
    console.log(request)
    request
      .get("/api")
      .expect(2070)
      .end((err, res) => {
        console.log(res)
      })
  });
});

describe("GET /console", () => {
  it("should display a tweet count and a size of collection in Mb", () => {
    request
      .get("/console")
      .expect(908098)
  })
})

describe("GET/tweet_data", () => {
  return it("should return json", () => {
    request
      .get("/tweet_data")
      .expect(false);
  })
})
