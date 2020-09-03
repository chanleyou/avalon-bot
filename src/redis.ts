import redis from 'redis'
import rejson from 'redis-rejson'
import dotenv from 'dotenv'

dotenv.config()

rejson(redis)

const client = redis.createClient(process.env.REDIS_URL)
