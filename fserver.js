/*******************************
*   Search server simulator
*    Listening for JSON objects
*    {
*      event: GET_TEST_IMAGES,     
*      data:  ""
*    }
*    Returns  3 fake "search images"
*    and
*    {
*      event: SEARCH_REQUEST,     
*      data:  [imageId]
*    }
*    imageId - id of selected searvh images
*    Returns random number of fake found images.
*
*    Fake search server returns an array of
*     {
*        imagedata: [image data]     {Buffer.from(axiosres.data).toString('base64')
*        imageID:   [imageId]
*      }
*
******************************/
const WebSocket = require('ws');
const axios = require('axios');

const wss = new WebSocket.Server({ port: 8082});

// SERVER ------------------
wss.on("connection", ws => {
    ws.on("message", message => {
        let data;

        try{
            data = parseMessage(message);

            switch (data.event) {
                case "GET_TEST_IMAGES":
                    //console.log("OK ... GET_TEST_IMAGES");
                    sendFakeImages(3, ws);
                    break;
                case "SEARCH_REQUEST":
                    //console.log("OK ... SEARCH_REQUEST");
                    // data.imageId -  idetifies image for reverse search
                    // imageNumber -  random number of fake returned images
                    const imageNumber = (Math.floor(Math.random() * 10) + 1).toString();
                    sendFakeImages(imageNumber, ws);                    
                    break;    
                    default:            
                    // return error
            }
        } catch(err) {
            //console.log(`INVALIDE MESSAGE: ${err.message}`);
            return;
        }
        
    })

}); 

// FUNCTIONS ------------------

// Generate fake images and send them to app server
const sendFakeImages = async (imageNumber,ws) => {
    const results = [];
    for (let i = 0; i < imageNumber; i++) {
        const imageID = (Math.floor(Math.random() * 1000) + 1).toString();
        try {
            axiosres = (await axios.get('https://robohash.org/'+ imageID, { responseType: 'arraybuffer' })); 
          } catch(e) {
            //console.log('Catch an error: ', e);
          } 
      const imageobj = {
        imagedata: Buffer.from(axiosres.data).toString('base64'),
        imageID:   imageID
      }
      results.push(imageobj);
    }

   data = JSON.stringify(results)

   ws.send(data);
}



function parseMessage(message) {
    const object = JSON.parse(message);

    if(!("event" in object)) {
        throw new Error("Event property not provided");
    }

    if(!("data" in object)) {
        throw new Error("Data property not provided");
    }

    return object;
}




