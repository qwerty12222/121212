import cv2
import pytesseract
from sympy import sympify, SympifyError
from telegram import Update
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters, CallbackContext

# Tesseractning o'rnatilgan joyini ko'rsatish (Tesseract o'rnatilishi kerak)
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Botning boshlanishi
def start(update: Update, context: CallbackContext):
    update.message.reply_text("Salom! Matematik ifoda yoki rasm yuboring.")

# Matn orqali matematik ifodani yechish
def solve_math(update: Update, context: CallbackContext):
    user_text = update.message.text
    try:
        result = sympify(user_text)
        update.message.reply_text(f"Natija: {result}")
    except SympifyError:
        update.message.reply_text("Ifoda yechilmadi.")

# Rasmni qabul qilish va OCR orqali yechish
def handle_photo(update: Update, context: CallbackContext):
    photo = update.message.photo[-1].get_file()
    photo.download('math_photo.jpg')

    # Rasmni o'qib, matnni olish
    image = cv2.imread('math_photo.jpg')
    text = pytesseract.image_to_string(image)

    # Olingan matnni yechishga urinish
    try:
        result = sympify(text)
        update.message.reply_text(f"Rasmdagi matn: {text}\nNatija: {result}")
    except SympifyError:
        update.message.reply_text(f"Rasmda olingan matnni yechish mumkin emas: {text}")

# Botni ishga tushirish
def main():
    updater = Updater("7523594936:AAGORr-SiRA0NBX647ZJinbMG4LSQmhPybU", use_context=True)

    dispatcher = updater.dispatcher
    dispatcher.add_handler(CommandHandler("start", start))
    dispatcher.add_handler(MessageHandler(Filters.text & ~Filters.command, solve_math))
    dispatcher.add_handler(MessageHandler(Filters.photo, handle_photo))

    updater.start_polling()
    updater.idle()

if __name__ == '__main__':
    main()

