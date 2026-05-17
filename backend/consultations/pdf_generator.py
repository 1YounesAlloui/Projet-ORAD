import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
import datetime

def generate_consultation_pdf(consultation):
    buffer = io.BytesIO()
    
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Styles personnalisés
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#0284c7'),
        alignment=1,  # Centré
        spaceAfter=15
    )
    
    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#0f172a'),
    )
    
    section_title_style = ParagraphStyle(
        'SecTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=15,
        textColor=colors.HexColor('#0284c7'),
        spaceBefore=10,
        spaceAfter=8
    )
    
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#1e293b'),
    )
    
    medicament_style = ParagraphStyle(
        'MedicamentStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=18,
        textColor=colors.HexColor('#0f172a'),
        leftIndent=15,
        spaceAfter=5
    )
    
    story = []
    
    # 1. EN-TÊTE MÉDECIN (sans cadre, sans signature)
    doctor = consultation.doctor
    patient = consultation.patient
    
    doc_name = f"Dr. {doctor.user.first_name} {doctor.user.last_name}"
    doc_specialty = doctor.specialty or "Médecin généraliste"
    doc_email = doctor.user.email
    doc_phone = doctor.user.phone_number or "+213 550 00 00 00"
    
    doctor_info = f"""
    <b>{doc_name}</b><br/>
    <font size="9" color="#475569">Spécialité : {doc_specialty}<br/>
    Tél : {doc_phone}<br/>
    Email : {doc_email}</font>
    """
    
    # Optionnel : adresse de cabinet (vous pouvez laisser vide ou commenter)
    # cabinet_address = "123, Boulevard des Martyrs, Alger"
    
    header_table_data = [
        [Paragraph(doctor_info, header_style)]
    ]
    
    header_table = Table(header_table_data, colWidths=[480])
    header_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(header_table)
    
    # Ligne de séparation
    story.append(HRFlowable(width="100%", thickness=1.2, color=colors.HexColor('#0284c7'), spaceAfter=15))
    
    # 2. TITRE
    story.append(Paragraph("ORDONNANCE MÉDICALE", title_style))
    story.append(Spacer(1, 5))
    
    # 3. INFORMATIONS PATIENT (minimales)
    age_str = "N/A"
    if patient.date_of_birth:
        today = datetime.date.today()
        dob = patient.date_of_birth
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        age_str = f"{age} ans"
    
    p_name = f"{patient.user.first_name} {patient.user.last_name}"
    c_date = consultation.consultation_date.strftime("%d/%m/%Y")
    
    info_html = f"""
    <b>Patient :</b> {p_name} &nbsp;&nbsp;|&nbsp;&nbsp;
    <b>Âge :</b> {age_str} &nbsp;&nbsp;|&nbsp;&nbsp;
    <b>Date :</b> {c_date}
    """
    
    info_table = Table([[Paragraph(info_html, body_style)]], colWidths=[480])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 20))
    
    # 4. MÉDICAMENTS PRESCRITS (seulement les médicaments)
    story.append(Paragraph("Médicaments prescrits :", section_title_style))
    story.append(Spacer(1, 5))
    
    prescription_text = consultation.prescription if consultation.prescription else "Aucun médicament prescrit."
    prescription_text = prescription_text.replace("\n", "<br/>")
    
    story.append(Paragraph(prescription_text, medicament_style))
    story.append(Spacer(1, 20))
    
    # 5. AUCUNE ZONE DE SIGNATURE NI CACHET - rien n'est ajouté après les médicaments
    
    # Construction du PDF
    doc.build(story)
    
    pdf = buffer.getvalue()
    buffer.close()
    return pdf