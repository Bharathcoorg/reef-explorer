import axios, {AxiosResponse} from "axios";

const coingeckoApi = axios.create({baseURL: "https://api.coingecko.com/api/v3/"});

type HistoryData = { [date: string]: number };

type PriceHistory = {
  market_data: {
    current_price: {
      [currency: string]: number;
    };
  };
};

type CurrentPrice = {
  [currency: string]: {
    usd: number;
  };
};

const date2String = (date: Date): string => `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;

// Retrieving current reef price from coingecko
const getReefCurrentPrice = async (): Promise<number> => coingeckoApi
  .get<void, AxiosResponse<CurrentPrice>>(
    `/simple/price?ids=reef&vs_currencies=usd`,
  )
  .then((res) => res.data.reef.usd)
  .catch((err) => {
    throw new Error('Error getting current price from coingecko: ' + err.message);
  });

// Retrieving reef price history from coingecko
const getReefPriceHistory = async (date: Date): Promise<number> => coingeckoApi
  .get<void, AxiosResponse<PriceHistory>>(
    `/coins/reef/history?date=${date2String(date)}`
  )
  .then((res) => res.data.market_data.current_price.reef)
  .catch((err) => {
    throw new Error('Error getting history price from coingecko: ' + err.message);
  });


class CoingeckoReefHistoryHandler {
  private static history: HistoryData = {};

  static async getPrice(date: Date): Promise<number> {
    // Check if date is less then one minute old, if so return latest price
    if (date > new Date(Date.now() - 1000 * 60)) {

      // TODO maybe clean history?
      return await getReefCurrentPrice();
    }
    
    // Else return price from history
    const dt = date2String(date);
    
    // Check if date is in history return price
    if (this.history[dt]) {
      return this.history[dt];
    };

    // Else get price from coingecko, add to history and return price
    this.history[dt] = await getReefPriceHistory(date);
    return this.history[dt];
  }
}

export default CoingeckoReefHistoryHandler;