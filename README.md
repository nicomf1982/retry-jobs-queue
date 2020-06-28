# retry-jobs-queue
a POC for retry and delayed jobs using rabbitmq 

#### BEFORE TO START !

Pull the image with 'docker pull rabbitmq:3-management'

do a 'docker run -d -p 15672:15672 -p 5672:5672 --name rabbit-poc rabbitmq:3-management'

go to the http://localhost:15672/#/ for a GUI

run producer.js, and few consumer.js in another terminal to see work queues in action

