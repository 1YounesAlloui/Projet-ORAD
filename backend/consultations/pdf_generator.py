import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
import datetime

def generate_consultation_pdf(consultation):
    buffer = io.BytesIO()
    
    # Setup document with clean margins
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Styles for premium medical layout
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#0284c7'), # Medical Blue
        alignment=1, # Centered
        spaceAfter=15
    )
    
    header_left_style = ParagraphStyle(
        'HeaderLeft',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=colors.HexColor('#0f172a'),
    )
    
    section_title_style = ParagraphStyle(
        'SecTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=14,
        textColor=colors.HexColor('#0284c7'),
        spaceBefore=12,
        spaceAfter=5
    )
    
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#1e293b'),
    )

    italic_style = ParagraphStyle(
        'ItalicTextCustom',
        parent=body_style,
        fontName='Helvetica-Oblique',
    )
    
    story = []
    
    # 1. HEADER (Two-column layout: Left = Doctor, Right = Clinic/Hospital)
    doctor = consultation.doctor
    patient = consultation.patient
    
    doc_name = f"Dr. {doctor.user.first_name} {doctor.user.last_name}"
    doc_specialty = doctor.specialty or "Generaliste"
    doc_email = doctor.user.email
    doc_phone = doctor.user.phone_number or "+213 550 00 00 00"
    
    left_header = f"""
    <b>{doc_name}</b><br/>
    <font size="9" color="#475569">Specialite : {doc_specialty}<br/>
    Tel : {doc_phone}<br/>
    Email : {doc_email}</font>
    """
    
    right_header = """
    <b>Etablissement Hospitalier Specialise (EHS)</b><br/>
    <font size="9" color="#475569">Service de Consultation Medicale<br/>
    123, Boulevard des Martyrs, Alger<br/>
    Algerie</font>
    """
    
    header_table_data = [
        [Paragraph(left_header, header_left_style), Paragraph(right_header, ParagraphStyle('HeaderRight', parent=header_left_style, alignment=2))]
    ]
    
    header_table = Table(header_table_data, colWidths=[260, 260])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(header_table)
    
    # Horizontal rule
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0284c7'), spaceAfter=15))
    
    # 2. TITLE
    story.append(Paragraph("ORDONNANCE MEDICALE", title_style))
    story.append(Spacer(1, 10))
    
    # 3. PATIENT & CONSULTATION INFORMATION BOX
    age_str = "N/A"
    if patient.date_of_birth:
        today = datetime.date.today()
        dob = patient.date_of_birth
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        age_str = f"{age} ans (Ne(e) le {dob.strftime('%d/%m/%Y')})"
        
    p_name = f"{patient.user.first_name} {patient.user.last_name}"
    p_phone = patient.user.phone_number or "N/A"
    c_date = consultation.consultation_date.strftime("%d/%m/%Y")
    
    info_html = f"""
    <b>Patient :</b> {p_name}<br/>
    <b>Age :</b> {age_str}<br/>
    <b>Telephone :</b> {p_phone}
    """
    
    date_html = f"""
    <br/>
    <b>Date de consultation :</b> {c_date}<br/>
    <b>ID Ordonnance :</b> ORD-{consultation.id:05d}
    """
    
    info_table_data = [
        [Paragraph(info_html, body_style), Paragraph(date_html, ParagraphStyle('InfoRight', parent=body_style, alignment=2))]
    ]
    info_table = Table(info_table_data, colWidths=[265, 255])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 12),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('LEFTPADDING', (0,0), (-1,-1), 15),
        ('RIGHTPADDING', (0,0), (-1,-1), 15),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 20))
    
    # 4. MEDICAL DETAILS SECTIONS
    # Symptoms
    story.append(Paragraph("Symptomes / Symptoms :", section_title_style))
    story.append(Paragraph(consultation.symptoms.replace("\n", "<br/>") if consultation.symptoms else "N/A", body_style))
    story.append(Spacer(1, 10))
    
    # Diagnosis
    story.append(Paragraph("Diagnostic / Diagnosis :", section_title_style))
    story.append(Paragraph(consultation.diagnosis.replace("\n", "<br/>") if consultation.diagnosis else "N/A", body_style))
    story.append(Spacer(1, 10))
    
    # Prescription (often multiple lines, make it look nice)
    story.append(Paragraph("Prescription Medicale / Prescription :", section_title_style))
    prescription_text = consultation.prescription.replace("\n", "<br/>") if consultation.prescription else "N/A"
    story.append(Paragraph(prescription_text, ParagraphStyle('PrescStyle', parent=body_style, fontName='Helvetica-Bold', leading=16, textColor=colors.HexColor('#0f172a'))))
    story.append(Spacer(1, 10))
    
    # Notes (if any)
    if consultation.notes:
        story.append(Paragraph("Remarques / Observations :", section_title_style))
        story.append(Paragraph(consultation.notes.replace("\n", "<br/>"), italic_style))
        story.append(Spacer(1, 15))
        
    story.append(Spacer(1, 20))
    
    # 5. SIGNATURE & STAMP AREA (Table at bottom right)
    sign_html = f"""
    Alger, le {c_date}<br/><br/>
    <b>Cachet et Signature du Medecin</b><br/>
    <font size="8" color="#64748b">{doc_name}</font>
    """
    sign_table_data = [
        ["", Paragraph(sign_html, ParagraphStyle('SignStyle', parent=body_style, alignment=1))]
    ]
    sign_table = Table(sign_table_data, colWidths=[320, 200])
    sign_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor('#f8fafc')),
        ('BOX', (1,0), (1,0), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (1,0), (1,0), 10),
        ('BOTTOMPADDING', (1,0), (1,0), 45), # Extra height for signature/stamp
        ('LEFTPADDING', (1,0), (1,0), 10),
        ('RIGHTPADDING', (1,0), (1,0), 10),
    ]))
    story.append(sign_table)
    
    # Build document
    doc.build(story)
    
    pdf = buffer.getvalue()
    buffer.close()
    return pdf
