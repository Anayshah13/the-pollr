from fastapi import FastAPI
from imgs import Image

app=FastAPI()

@app.get("/")
def greet():
    return "Hello, Gang!"

@app.get("/committee_imgs")
def committee_imgs():
    return images

images=[Image(id=1, name="Image 1", url="http://example.com/image1.jpg", type="committee")]

@app.post("/add_image")
def add_image(image: Image):
    images.append(image)
    return image

@app.delete("/delete_image/{image_id}")
def delete_image(image_id: int):
    global images
    images = [img for img in images if img.id != image_id]
    return {"message": f"Image with id {image_id} deleted."}
