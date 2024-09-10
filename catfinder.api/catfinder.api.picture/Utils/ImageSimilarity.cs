using System.Drawing;
using System.Text;
using System.IO;
using System.Drawing.Imaging;

namespace catfinder.api.picture.Utils
{
	public static class ImageSimilarityUtil
	{
		/// <summary>
		/// Calculate Hanming Distance
		/// </summary>
		/// <param name="sourceHashCode">source hashCode</param>
		/// <param name="hashCode">compare hashCode</param>
		/// <returns></returns>
		public static int HammingDistance(string? sourceHashCode, string? hashCode)
		{
			if (string.IsNullOrEmpty(sourceHashCode) || string.IsNullOrEmpty(hashCode))
			{
				return int.MaxValue;
			}

			int difference = 0;
			int len = sourceHashCode.Length;
			for (int i = 0; i < len; i++)
			{
				if (sourceHashCode[i] != hashCode[i])
				{
					difference++;
				}
			}

			return difference;
		}



		/// <summary>
		/// Get Hash Code
		/// </summary>
		/// <param name="filename"></param>
		/// <returns></returns>
		public static string ProduceFinger(string filename)
		{
			try
			{
				using var source = Image.FromFile(filename);
				return produceFinger(source);
			}
			catch (Exception ex)
			{
				// 考虑记录异常
				Console.WriteLine($"Error producing finger from file: {ex.Message}");
				return string.Empty;
			}
		}

		/// <summary>
		/// Get Hash Code
		/// </summary>
		/// <param name="file"></param>
		/// <returns></returns>
		private static string produceFinger(Image file)
		{
			using Image source = (Image)file.Clone();

			int width = 8;
			int height = 8;
			// Step 1
			Bitmap b = new(source, 8, 8);
			Image thumb = b;
			// Step 2
			int[] pixels = new int[width * height];
			for (int i = 0; i < width; i++)
			{
				for (int j = 0; j < height; j++)
				{
					pixels[i * height + j] = RgbToGray(((Bitmap)thumb).GetPixel(i, j));
				}
			}
			// Step 3
			int avgPixel = Average(pixels);
			// Step 4
			int[] comps = new int[width * height];
			for (int i = 0; i < comps.Length; i++)
			{
				if (pixels[i] >= avgPixel)
				{
					comps[i] = 1;
				}
				else
				{
					comps[i] = 0;
				}
			}
			// Step 5
			StringBuilder hashCode = new();
			for (int i = 0; i < comps.Length; i += 4)
			{
				int result = comps[i] * (int)Math.Pow(2, 3) + comps[i + 1] * (int)Math.Pow(2, 2) + comps[i + 2] * (int)Math.Pow(2, 1) + comps[i + 2];
				hashCode.Append(BinaryToHex(result));
			}

			return hashCode.ToString();
		}

		/// <summary>
		/// Calculate Gray 
		/// </summary>
		/// <param name="posClr"></param>
		/// <returns></returns>
		private static int RgbToGray(Color posClr)
		{
			return (posClr.R + posClr.G + posClr.B + posClr.A) / 4;
			//return (posClr.R * 19595 + posClr.G * 38469 + posClr.B * 7472) >> 16;
		}
		/// <summary>
		/// Calculate Average
		/// </summary>
		/// <param name="pixels"></param>
		/// <returns></returns>
		private static int Average(int[] pixels)
		{
			float m = 0;
			for (int i = 0; i < pixels.Length; ++i)
			{
				m += pixels[i];
			}

			m /= pixels.Length;
			return (int)m;
		}


		/// <summary>
		/// Get Binary Hex
		/// </summary>
		/// <param name="binary"></param>
		/// <returns></returns>
		private static string BinaryToHex(int binary)
		{
			string[] bintoHex = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
			if (binary >= 0 && binary <= 15)
			{
				return bintoHex[binary];
			}

			return " ";
		}

		public static string ProduceFingerFromBytes(byte[] imageBytes)
		{
			try
			{
				using var memoryStream = new MemoryStream(imageBytes);
				using var image = Image.FromStream(memoryStream);

				return produceFinger(image);
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Error producing finger from bytes: {ex.Message}");
				return string.Empty;
			}
		}
	}
}
